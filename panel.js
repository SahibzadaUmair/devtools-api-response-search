// ======================================================
// Array that will store captured network responses
// ======================================================
let responses = [];

// ======================================================
// Get elements from panel.html
// ======================================================
let searchBtn = document.getElementById("searchBtn");
let searchInput = document.getElementById("searchValue");
let results = document.getElementById("results");

// ======================================================
// Capture Network Responses
// Fires every time a network request finishes
// ======================================================
chrome.devtools.network.onRequestFinished.addListener(function(request){
    request.getContent(function(body){
        let type = "";
        if(!request.response || !request.response.headers) return;

        request.response.headers.forEach(function(header){
            if(header.name.toLowerCase() === "content-type"){
                type = header.value;
            }
        });

        // Store only useful responses
        if(type.includes("json") || type.includes("text/html")){
            responses.push({
                url: request.request.url,
                body: body,
                type: type
            });

            // Remove "Page changed..." message if it exists
            if(results.innerHTML.includes("Page changed")) {
                results.innerHTML = "";
            }
        }
    });
});

// ======================================================
// Reset responses when user navigates to a new page
// ======================================================
chrome.devtools.network.onNavigated.addListener(function(){
    responses = [];
    results.innerHTML = `
        <div class="result">
        Page changed. Waiting for network requests...
        </div>
    `;
});

// ======================================================
// Search Button Logic
// ======================================================
searchBtn.addEventListener("click", function(){
    let value = searchInput.value.trim().toLowerCase();
    results.innerHTML = "";
    let found = false;

    // If no responses captured yet
    if(responses.length === 0){
        let div = document.createElement("div");
        div.className = "result";
        div.innerHTML = `
            <strong>No Requests Captured Yet</strong><br>
            Reload page or perform an action.
        `;
        results.appendChild(div);
        return;
    }

    // Loop through stored responses
    responses.forEach(function(res){
        if(res.body && res.body.toLowerCase().includes(value)){
            found = true;
            let div = document.createElement("div");
            div.className = "result";
            div.innerHTML = `
                <strong>Match Found</strong><br>
                <a href="#" class="copyUrl">${res.url}</a>
            `;

            // Click event: copy URL to clipboard
            div.querySelector(".copyUrl").addEventListener("click", function(e){
                e.preventDefault();

                navigator.clipboard.writeText(res.url)
                    .then(() => {
                        let msg = document.createElement("div");
                        msg.className = "toast";
                        msg.textContent = "Copied!";
                        div.appendChild(msg);

                        // Remove after 1 second
                        setTimeout(() => msg.remove(), 1000);
                    })
                    .catch(err => console.error("Copy failed", err));
            });
            results.appendChild(div);
        }
    });

    // If no match found
    if(!found){
        let div = document.createElement("div");
        div.className = "result";
        div.innerHTML = `<strong>No Match Found</strong>`;
        results.appendChild(div);
    }
});