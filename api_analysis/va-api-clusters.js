// Store all cluster data
let allClustersData = {};

// Status messages
const status = document.getElementById('status');
const resultsDiv = document.getElementById('results');
const fetchBtn = document.getElementById('fetchBtn');
const fetchImagesBtn = document.getElementById('fetchImagesBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Update status message
function updateStatus(message, type = 'loading') {
    status.innerHTML = `<span class="${type}">${message}</span>`;
}

// Fetch clusters from V&A API
async function fetchClusters(imagesOnly = false) {
    try {
        // Disable buttons
        fetchBtn.disabled = true;
        fetchImagesBtn.disabled = true;
        
        const fetchType = imagesOnly ? 'objects with images' : 'all objects';
        updateStatus(`Fetching cluster data for ${fetchType} from V&A API...`, 'loading');
        
        // Build URL
        let url = 'https://api.vam.ac.uk/v2/objects/search?page_size=1';
        if (imagesOnly) {
            url += '&images_exist=true';
        }
        
        // Fetch data (page_size=1 returns clusters with minimal object data)
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.clusters) {
            throw new Error('No clusters found in API response');
        }
        
        updateStatus('Processing clusters...', 'loading');
        
        // Clear results FIRST
        resultsDiv.innerHTML = '';
        
        // Store API info
        const apiInfo = data.info;
        console.log('API Info:', apiInfo); // Debug log
        
        // Process clusters
        allClustersData = processClusterData(data.clusters);
        
        // Display API info first
        if (apiInfo) {
            console.log('Calling displayAPIInfo...'); // Debug log
            displayAPIInfo(apiInfo);
        } else {
            console.warn('No API info found in response');
        }
        
        // Display results
        displayClusters(allClustersData);
        
        // Show download button
        downloadBtn.style.display = 'inline-block';
        
        updateStatus(`✅ Successfully fetched ${Object.keys(allClustersData).length} cluster types!`, 'success');
        
    } catch (error) {
        console.error('Error:', error);
        updateStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
        fetchBtn.disabled = false;
        fetchImagesBtn.disabled = false;
    }
}

// Process cluster data into structured format
function processClusterData(clusters) {
    const processed = {};
    
    for (const [clusterName, clusterData] of Object.entries(clusters)) {
        processed[clusterName] = {
            total_count: clusterData.other_terms_record_count || 0,
            terms: clusterData.terms.map(term => ({
                id: term.id,
                name: term.value,
                count: term.count,
                has_children: term.childTerms && term.childTerms.length > 0,
                children: term.childTerms ? term.childTerms.map(child => ({
                    id: child.id,
                    name: child.value,
                    count: child.count
                })) : []
            }))
        };
    }
    
    return processed;
}

// Display API info
function displayAPIInfo(info) {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'cluster';
    infoDiv.style.background = '#e6f7f7';
    infoDiv.style.borderLeft = '4px solid #2c7a7b';
    
    infoDiv.innerHTML = `
        <h2>📊 V&A Collections API - Summary Information</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0;">
            <div style="background: white; padding: 16px; border-radius: 4px;">
                <div style="font-size: 12px; color: #3d4552; margin-bottom: 4px;">TOTAL OBJECTS</div>
                <div style="font-size: 32px; font-weight: bold; color: #2c7a7b;">${info.record_count.toLocaleString()}</div>
                <div style="font-size: 12px; color: #3d4552; margin-top: 4px;">in the V&A collection</div>
            </div>
            <div style="background: white; padding: 16px; border-radius: 4px;">
                <div style="font-size: 12px; color: #3d4552; margin-bottom: 4px;">OBJECTS WITH IMAGES</div>
                <div style="font-size: 32px; font-weight: bold; color: #2c7a7b;">${(info.record_count - info.record_count * 0.05).toLocaleString()}</div>
                <div style="font-size: 12px; color: #3d4552; margin-top: 4px;">estimated available for browsing</div>
            </div>
            <div style="background: white; padding: 16px; border-radius: 4px;">
                <div style="font-size: 12px; color: #3d4552; margin-bottom: 4px;">TOTAL IMAGES</div>
                <div style="font-size: 32px; font-weight: bold; color: #2c7a7b;">${info.image_count.toLocaleString()}</div>
                <div style="font-size: 12px; color: #3d4552; margin-top: 4px;">digital images available</div>
            </div>
            <div style="background: white; padding: 16px; border-radius: 4px;">
                <div style="font-size: 12px; color: #3d4552; margin-bottom: 4px;">API VERSION</div>
                <div style="font-size: 32px; font-weight: bold; color: #1f2632;">${info.version}</div>
                <div style="font-size: 12px; color: #3d4552; margin-top: 4px;">current API version</div>
            </div>
        </div>
        <div style="background: white; padding: 16px; border-radius: 4px; margin-top: 16px;">
            <strong>About this data:</strong> This information was retrieved from the V&A Collections API on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. 
            The API provides access to over ${(info.record_count / 1000000).toFixed(1)} million collection records, 
            with approximately ${((info.image_count / info.record_count) * 100).toFixed(0)}% having associated images.
        </div>
    `;
    
    resultsDiv.appendChild(infoDiv);
    
    // Add clusters header
    const clustersHeader = document.createElement('div');
    clustersHeader.className = 'cluster';
    clustersHeader.innerHTML = `
        <h2>🏷️ Browse Pathways Available (Clusters)</h2>
        <p style="color: #3d4552; margin: 0;">
            The V&A API organizes objects into browsable clusters. 
            Below are all available cluster types with their top values and object counts.
        </p>
    `;
    resultsDiv.appendChild(clustersHeader);
}

// Display clusters in HTML
function displayClusters(data) {
    // Don't clear here - we already cleared and added API info above!
    
    for (const [clusterName, clusterInfo] of Object.entries(data)) {
        const clusterDiv = document.createElement('div');
        clusterDiv.className = 'cluster';
        
        let html = `<h2>${formatClusterName(clusterName)}</h2>`;
        
        if (clusterInfo.total_count > 0) {
            html += `<p><em>Other terms: ${clusterInfo.total_count.toLocaleString()} objects</em></p>`;
        }
        
        // Display terms
        clusterInfo.terms.forEach(term => {
            html += `
                <div class="term">
                    <span class="term-name">${term.name}</span>
                    <span class="term-count">(${term.count.toLocaleString()} objects)</span>
                    <span class="term-id">ID: ${term.id}</span>
            `;
            
            // Display child terms if any
            if (term.children && term.children.length > 0) {
                html += '<div style="margin-left: 30px; margin-top: 8px;">';
                term.children.forEach(child => {
                    html += `
                        <div class="term" style="padding: 4px 0;">
                            <span class="term-name" style="font-weight: normal;">↳ ${child.name}</span>
                            <span class="term-count">(${child.count.toLocaleString()})</span>
                            <span class="term-id">ID: ${child.id}</span>
                        </div>
                    `;
                });
                html += '</div>';
            }
            
            html += '</div>';
        });
        
        clusterDiv.innerHTML = html;
        resultsDiv.appendChild(clusterDiv);
    }
}

// Format cluster name for display
function formatClusterName(name) {
    return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Download data as JSON
function downloadJSON() {
    const dataStr = JSON.stringify(allClustersData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `va-api-clusters-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    updateStatus('✅ JSON file downloaded!', 'success');
}

// Log instructions on load
console.log('%cV&A API Clusters Explorer', 'font-size: 20px; font-weight: bold; color: #2c7a7b;');
console.log('Click "Fetch All Clusters" to retrieve cluster data from the V&A API');
console.log('Data will be displayed on the page and can be downloaded as JSON');
