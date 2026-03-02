// Store association data
let associationData = {};

// DOM elements
const status = document.getElementById('status');
const resultsDiv = document.getElementById('results');
const fetchBtn = document.getElementById('fetchBtn');
const downloadBtn = document.getElementById('downloadBtn');
const samplesPerRangeInput = document.getElementById('samplesPerRange');
const rangeSizeInput = document.getElementById('rangeSize');
const estimatedTotalSpan = document.getElementById('estimatedTotal');

// Update estimated total when inputs change
function updateEstimate() {
    const samplesPerRange = parseInt(samplesPerRangeInput.value) || 5;
    const rangeSize = parseInt(rangeSizeInput.value) || 2000;
    
    // Approximate calculation based on 730k objects with images
    const approxTotalPages = 48692; // 730k / 15 per page
    const numRanges = Math.ceil(approxTotalPages / rangeSize);
    const estimatedTotal = samplesPerRange * numRanges;
    
    estimatedTotalSpan.textContent = `~${estimatedTotal}`;
}

// Add event listeners to update estimate
samplesPerRangeInput.addEventListener('input', updateEstimate);
rangeSizeInput.addEventListener('input', updateEstimate);

// Initialize estimate
updateEstimate();

// Update status message
function updateStatus(message, type = 'loading') {
    status.innerHTML = `<span class="${type}">${message}</span>`;
}

// Fetch and analyze association types
async function fetchAssociations() {
    try {
        // Get values from inputs
        const samplesPerRange = parseInt(samplesPerRangeInput.value) || 5;
        const pageRangeSize = parseInt(rangeSizeInput.value) || 2000;
        
        // Disable button and inputs
        fetchBtn.disabled = true;
        samplesPerRangeInput.disabled = true;
        rangeSizeInput.disabled = true;
        
        updateStatus(`Preparing to fetch random samples from V&A API...`, 'loading');
        resultsDiv.innerHTML = '';
        
        const associations = {};
        let objectsAnalyzed = 0;
        let objectsWithOrigin = 0;
        
        // First, get total number of objects available
        updateStatus('Step 1: Checking total objects available...', 'loading');
        const initialUrl = `https://api.vam.ac.uk/v2/objects/search?page=1&page_size=1&images_exist=true`;
        const initialResponse = await fetch(initialUrl);
        
        if (!initialResponse.ok) {
            throw new Error(`Search API Error: ${initialResponse.status}`);
        }
        
        const initialData = await initialResponse.json();
        const totalRecords = initialData.info.record_count;
        const totalPages = initialData.info.pages;
        
        console.log(`Total objects with images: ${totalRecords}`);
        console.log(`Total pages: ${totalPages}`);
        
        // Calculate ranges (pageRangeSize is from input)
        const numRanges = Math.ceil(totalPages / pageRangeSize);
        const totalToFetch = samplesPerRange * numRanges;
        
        console.log(`Sampling ${samplesPerRange} objects from each of ${numRanges} ranges (total: ${totalToFetch} objects)`);
        updateStatus(`Fetching ${totalToFetch} objects (${samplesPerRange} per range)...`, 'loading');
        
        const objectIds = [];
        
        // Get random samples from different page ranges
        for (let range = 0; range < numRanges; range++) {
            const startPage = (range * pageRangeSize) + 1;
            const endPage = Math.min((range + 1) * pageRangeSize, totalPages);
            
            // Pick random pages within this range
            for (let i = 0; i < samplesPerRange; i++) {
                const randomPage = Math.floor(Math.random() * (endPage - startPage + 1)) + startPage;
                
                updateStatus(`Step 1: Fetching from page ${randomPage} (range ${range + 1}/${numRanges})...`, 'loading');
                
                try {
                    const searchUrl = `https://api.vam.ac.uk/v2/objects/search?page=${randomPage}&page_size=1&images_exist=true`;
                    const searchResponse = await fetch(searchUrl);
                    
                    if (!searchResponse.ok) {
                        console.warn(`Failed to fetch page ${randomPage}`);
                        continue;
                    }
                    
                    const searchData = await searchResponse.json();
                    
                    if (searchData.records && searchData.records.length > 0) {
                        objectIds.push(searchData.records[0].systemNumber);
                    }
                    
                    // Small delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 50));
                    
                } catch (error) {
                    console.warn(`Error fetching page ${randomPage}:`, error);
                }
            }
        }
        
        console.log(`Collected ${objectIds.length} random object IDs across the collection`);
        
        // Now fetch full details for each object
        // Now fetch full details for each object
        const maxToFetch = objectIds.length;
        
        for (let i = 0; i < maxToFetch; i++) {
            const systemNumber = objectIds[i];
            objectsAnalyzed++;
            
            updateStatus(`Step 2: Analyzing object ${objectsAnalyzed} of ${maxToFetch}...`, 'loading');
            
            try {
                // Fetch full object details
                const objUrl = `https://api.vam.ac.uk/v2/object/${systemNumber}`;
                const objResponse = await fetch(objUrl);
                
                if (!objResponse.ok) {
                    console.warn(`Failed to fetch ${systemNumber}: ${objResponse.status}`);
                    continue;
                }
                
                const objData = await objResponse.json();
                const obj = objData.record;
                
                // Debug: Log first object structure
                if (objectsAnalyzed === 1) {
                    console.log('Sample full object structure:', obj);
                    console.log('Places field:', obj.placesOfOrigin);
                }
                
                if (obj.placesOfOrigin && obj.placesOfOrigin.length > 0) {
                    objectsWithOrigin++;
                    
                    // Debug: Log origin structure
                    if (objectsWithOrigin === 1) {
                        console.log('First origin found:', obj.placesOfOrigin);
                    }
                    
                    for (const origin of obj.placesOfOrigin) {
                        if (origin.association && origin.association.text) {
                            const assocText = origin.association.text;
                            
                            if (!associations[assocText]) {
                                associations[assocText] = {
                                    count: 0,
                                    id: origin.association.id || null,
                                    examples: []
                                };
                            }
                            
                            associations[assocText].count++;
                            
                            // Store a few examples
                            if (associations[assocText].examples.length < 3) {
                                associations[assocText].examples.push({
                                    objectTitle: obj.titles?.[0]?.title || 'Untitled',
                                    place: origin.place?.text || 'Unknown',
                                    systemNumber: obj.systemNumber
                                });
                            }
                        }
                    }
                }
                
                // Small delay to avoid rate limiting (very important now!)
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.warn(`Error fetching ${systemNumber}:`, error);
            }
        }
        
        // Store results
        associationData = {
            summary: {
                objectsAnalyzed,
                objectsWithOrigin,
                percentageWithOrigin: ((objectsWithOrigin / objectsAnalyzed) * 100).toFixed(1),
                uniqueAssociations: Object.keys(associations).length
            },
            associations: associations
        };
        
        // Display results
        displayResults(associationData);
        
        // Show download button
        downloadBtn.style.display = 'inline-block';
        
        updateStatus(`✅ Analysis complete! Found ${Object.keys(associations).length} unique association types from ${objectsAnalyzed} objects`, 'success');
        
    } catch (error) {
        console.error('Error:', error);
        updateStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
        fetchBtn.disabled = false;
        samplesPerRangeInput.disabled = false;
        rangeSizeInput.disabled = false;
    }
}

// Display results
function displayResults(data) {
    resultsDiv.innerHTML = '';
    
    // Summary box
    const summaryBox = document.createElement('div');
    summaryBox.className = 'results-box';
    summaryBox.innerHTML = `
        <h2>📊 Summary</h2>
        <ul>
            <li><strong>Objects Analyzed:</strong> ${data.summary.objectsAnalyzed}</li>
            <li><strong>Objects with Origin Data:</strong> ${data.summary.objectsWithOrigin} (${data.summary.percentageWithOrigin}%)</li>
            <li><strong>Unique Association Types:</strong> ${data.summary.uniqueAssociations}</li>
        </ul>
    `;
    resultsDiv.appendChild(summaryBox);
    
    // Association types box
    const assocBox = document.createElement('div');
    assocBox.className = 'results-box';
    assocBox.innerHTML = '<h2>🏷️ Association Types Found</h2>';
    
    // Sort by count
    const sorted = Object.entries(data.associations)
        .sort((a, b) => b[1].count - a[1].count);
    
    for (const [assocText, assocData] of sorted) {
        const item = document.createElement('div');
        item.className = 'association-item';
        
        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 18px;">"${assocText}"</strong>
                <span class="count">${assocData.count} occurrence${assocData.count !== 1 ? 's' : ''}</span>
            </div>
        `;
        
        if (assocData.id) {
            html += `<div style="color: #8f4a32; font-size: 12px; font-family: monospace; margin-top: 4px;">ID: ${assocData.id}</div>`;
        }
        
        if (assocData.examples.length > 0) {
            html += `<div style="margin-top: 8px; font-size: 14px; color: #3d4552;">`;
            html += `<strong>Examples:</strong><ul style="margin: 4px 0; padding-left: 20px;">`;
            for (const ex of assocData.examples) {
                html += `<li>${ex.place} (${assocText}) - "${ex.objectTitle}" (${ex.systemNumber})</li>`;
            }
            html += `</ul></div>`;
        }
        
        item.innerHTML = html;
        assocBox.appendChild(item);
    }
    
    resultsDiv.appendChild(assocBox);
}

// Download data as JSON
function downloadJSON() {
    const dataStr = JSON.stringify(associationData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `va-api-associations-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    updateStatus('✅ JSON file downloaded!', 'success');
}

// Log instructions on load
console.log('%cV&A API Association Types Analyzer', 'font-size: 20px; font-weight: bold; color: #2c7a7b;');
console.log('This script analyzes the "association" values in the placesOfOrigin field');
console.log('Examples: "made", "designed", "published", "manufactured", etc.');
