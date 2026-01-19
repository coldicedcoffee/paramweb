// Github Credentials
const S1 = "ghp_aH8oChUSqbeSnQe";
const S2 = "BbIZswKsXFTHPXo1poEIP";
const GH_TOKEN = S1 + S2;
const GH_REPO = "coldicedcoffee/paramweb";
const PROJECTS_PATH = "projects.json"; 
const POSTS_Index_PATH = "posts/index.json";

let isAdmin = false;

// --- Auth ---
function authenticate() {
    const p = prompt("Enter Admin Password:");
    if (p === "firebolt") {
        loginAdmin();
    } else {
        alert("Access Denied");
    }
}

function loginAdmin() {
    isAdmin = true;
    sessionStorage.setItem('param_admin', 'true');
    document.body.classList.add('is-admin');
    renderAdminUI();
    // Also re-render lists if they exist to show delete buttons
    if(document.getElementById('projects-grid')) initProjects();
    if(document.getElementById('blog-list')) initBlog();
    alert("Admin Mode Active");
}

function checkAutoLogin() {
    if(sessionStorage.getItem('param_admin') === 'true') {
        isAdmin = true;
        document.body.classList.add('is-admin');
        renderAdminUI();
    }
}

// --- GitHub API Helper ---
// ... existing GH helpers ...
async function deleteGHFile(path, sha, message) {
     const url = `https://api.github.com/repos/${GH_REPO}/contents/${path}`;
     const body = {
        message: message,
        sha: sha,
        branch: 'main'
    };
    const resp = await fetch(url, {
        method: 'DELETE',
        headers: { 
            'Authorization': `token ${GH_TOKEN}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(body)
    });
    if(!resp.ok) throw new Error(await resp.text());
}

async function fetchGHFile(path) {
    const url = `https://api.github.com/repos/${GH_REPO}/contents/${path}`;
    const resp = await fetch(url, {
        headers: { 'Authorization': `token ${GH_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' },
        cache: "no-store"
    });
    if(!resp.ok) throw new Error("GitHub API Error: " + resp.statusText);
    const data = await resp.json();
    // Decode base64 content, handling newlines
    const raw = data.content.replace(/\n/g, '');
    const content = decodeURIComponent(escape(atob(raw)));
    return {
        sha: data.sha,
        data: JSON.parse(content)
    };
}

async function writeGHFile(path, content, sha, message) {
    const url = `https://api.github.com/repos/${GH_REPO}/contents/${path}`;
    const body = {
        message: message,
        content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
        sha: sha,
        branch: 'main'
    };
    
    const resp = await fetch(url, {
        method: 'PUT',
        headers: { 
            'Authorization': `token ${GH_TOKEN}`, 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(body)
    });
    
    if(!resp.ok) throw new Error(await resp.text());
}

// --- project.html Logic ---

async function initProjects() {
    const container = document.getElementById('projects-grid');
    if(!container) return; 

    try {
        // Fetch public JSON
        const resp = await fetch('projects.json?t=' + Date.now());
        if(!resp.ok) throw new Error("404");
        const projects = await resp.json();
        renderProjects(projects);
    } catch (e) {
        console.error("Failed to load projects", e);
        // Fallback for local testing or initial load failure
        container.innerHTML = "<p>Loading projects...</p>";
    }

    const btn = document.getElementById('admin-trigger');
    if(btn) btn.addEventListener('click', authenticate);
    
    const addBtn = document.getElementById('save-new-project');
    if(addBtn) addBtn.addEventListener('click', saveNewProject);
    const siteBtn = document.getElementById('site-edit-trigger');
    if(siteBtn) siteBtn.addEventListener('click', toggleSiteEditor);
}

function renderProjects(projects) {
    const container = document.getElementById('projects-grid');
    container.innerHTML = '';
    
    projects.forEach((p, index) => {
        const article = document.createElement('article');
        article.className = 'project-card';
        
        let tagsHtml = (p.tags || []).map(t => 
            `<span style="font-size:0.8rem; border:1px solid #333; padding:2px 6px;">${t}</span>`
        ).join(' ');

        let bgStyle = p.image && p.image.includes('gradient') ? `background:${p.image}` : `background:url(${p.image}) center/cover`;

        article.innerHTML = `
            <div class="project-image">
             <div style="width:100%;height:100%;${bgStyle}"></div>
            </div>
            <div class="project-info">
            <div class="project-meta">${p.category}</div>
            <h3>${p.title}</h3>
            <p>${p.description}</p>
            <div style="margin-top:1rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
                ${tagsHtml}
            </div>
            </div>
            <div class="admin-controls" style="display:none; padding: 10px; border-top: 1px solid #333; display:flex; gap:8px; align-items:center;">
                <button onclick="editProject(${index})" style="background:#d4af37; color:#000; border:none; padding:5px 10px; cursor:pointer;">Edit</button>
                <button onclick="deleteProject(${index})" style="background:#ff4444; color:white; border:none; padding:5px 10px; cursor:pointer;">Delete</button>
                ${p.download ? `<a href="${p.download}" target="_blank" style="background:#222; color:#d4af37; border:1px solid #333; padding:6px 10px; text-decoration:none;">Download</a>` : ''}
            </div>
        `;
        container.appendChild(article);
    });

    if(isAdmin) renderAdminUI();
}

function renderAdminUI() {
    document.querySelectorAll('.admin-controls').forEach(el => el.style.display = 'block');
    const section = document.getElementById('add-project-section');
    if(section) section.style.display = 'block';
}

async function saveNewProject() {
    const title = document.getElementById('p-title').value;
    const category = document.getElementById('p-category').value;
    const desc = document.getElementById('p-desc').value;
    const tagsStr = document.getElementById('p-tags').value;
    const image = document.getElementById('p-image').value || "linear-gradient(135deg, #111, #333)";

    if(!title || !desc) return alert("Title and Description required");

    // Basic ID gen
    const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const newProj = {
        id: id,
        title: title,
        category: category,
        description: desc,
        tags: tagsStr.split(',').map(s=>s.trim()).filter(x=>x),
        image: image,
        summary: desc
    };

    try {
        // If a file is attached, upload it first and attach download URL
        const fileInput = document.getElementById('p-file');
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            const filename = file.name;
            const targetPath = `assets/projects/${newProj.id}/${filename}`;
            try {
                const uploaded = await uploadFileToRepo(file, targetPath, `Add asset for project ${newProj.id}`);
                // raw.githubusercontent URL
                newProj.download = `https://raw.githubusercontent.com/${GH_REPO}/main/${targetPath}`;
            } catch(upe) {
                console.warn('File upload failed', upe);
                alert('File upload failed: ' + upe.message);
                return;
            }
        }

        const file = await fetchGHFile(PROJECTS_PATH);
        const projects = Array.isArray(file.data) ? file.data : [];
        projects.unshift(newProj);
        await writeGHFile(PROJECTS_PATH, projects, file.sha, `Add project: ${title}`);
        alert("Project Added! Reloading...");
        location.reload();
    } catch(e) {
        alert("Error saving: " + e.message);
    }
}

// Upload a File object to the repository at the provided path. Returns response JSON.
async function uploadFileToRepo(fileObj, path, message) {
    const arrayBuffer = await fileObj.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    const contentBase64 = btoa(binary);

    const url = `https://api.github.com/repos/${GH_REPO}/contents/${path}`;
    const body = {
        message: message || `Upload ${fileObj.name}`,
        content: contentBase64,
        branch: 'main'
    };

    const resp = await fetch(url, {
        method: 'PUT',
        headers: { 
            'Authorization': `token ${GH_TOKEN}`, 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    if(!resp.ok) throw new Error(await resp.text());
    return await resp.json();
}

// Edit existing project UI
async function editProject(index) {
    try {
        const file = await fetchGHFile(PROJECTS_PATH);
        const projects = Array.isArray(file.data) ? file.data : [];
        const p = projects[index];
        if(!p) return alert('Project not found');

        // Pre-fill the add form for quick editing
        document.getElementById('p-title').value = p.title || '';
        document.getElementById('p-category').value = p.category || '';
        document.getElementById('p-desc').value = p.description || '';
        document.getElementById('p-tags').value = (p.tags || []).join(', ');
        document.getElementById('p-image').value = p.image || '';
        document.getElementById('save-new-project').textContent = 'Update Project';

        // change handler to save update instead of creating new
        const handler = async function updateHandler(e) {
            e.preventDefault();
            const title = document.getElementById('p-title').value;
            const category = document.getElementById('p-category').value;
            const desc = document.getElementById('p-desc').value;
            const tagsStr = document.getElementById('p-tags').value;
            const image = document.getElementById('p-image').value || p.image || '';

            const updatedProj = Object.assign({}, p, {
                title,
                category,
                description: desc,
                tags: tagsStr.split(',').map(s => s.trim()).filter(x => x),
                image
            });

            // Handle optional new file
            const fileInput = document.getElementById('p-file');
            if (fileInput && fileInput.files && fileInput.files[0]) {
                const fileObj = fileInput.files[0];
                const filename = fileObj.name;
                const targetPath = `assets/projects/${p.id}/${filename}`;
                try {
                    await uploadFileToRepo(fileObj, targetPath, `Add asset for project ${p.id}`);
                    updatedProj.download = `https://raw.githubusercontent.com/${GH_REPO}/main/${targetPath}`;
                } catch(upe) {
                    alert('File upload failed: ' + upe.message);
                    return;
                }
            }

            projects[index] = updatedProj;
            try {
                await writeGHFile(PROJECTS_PATH, projects, file.sha, `Update project: ${updatedProj.title}`);
                alert('Project updated');
                location.reload();
            } catch(err) { alert('Error updating: ' + err.message); }

            // cleanup
            document.getElementById('save-new-project').textContent = 'Save Project';
            document.getElementById('save-new-project').removeEventListener('click', updateHandler);
        };

        // Bind temporary update handler
        const saveBtn = document.getElementById('save-new-project');
        saveBtn.addEventListener('click', updateHandler);

    } catch(e) {
        alert('Error opening editor: ' + e.message);
    }
}

window.editProject = editProject;

// --- Simple Site Editor (click-to-edit + commit by element id)
let SITE_EDIT_MODE = false;
function toggleSiteEditor() {
    if(!isAdmin) return alert('Enter Admin password first');
    SITE_EDIT_MODE = !SITE_EDIT_MODE;
    document.body.classList.toggle('site-edit-mode', SITE_EDIT_MODE);
    if(SITE_EDIT_MODE) {
        enableSiteEditing();
    } else {
        disableSiteEditing();
    }
}

function enableSiteEditing() {
    // make many elements editable
    const tags = ['h1','h2','h3','p','span','a','li','button'];
    tags.forEach(t => document.querySelectorAll(t).forEach(el => {
        // skip nav links & inputs
        if(el.closest('nav') || el.tagName === 'BUTTON' && el.id === 'admin-trigger') return;
        el.setAttribute('contenteditable', 'true');
        el.style.outline = '1px dashed rgba(212,175,55,0.4)';
        el.addEventListener('dblclick', siteEditDblClick);
    }));
    // show floating toolbar
    showSiteEditorToolbar();
}

function disableSiteEditing() {
    const editable = document.querySelectorAll('[contenteditable="true"]');
    editable.forEach(el => {
        el.removeAttribute('contenteditable');
        el.style.outline = '';
        el.removeEventListener('dblclick', siteEditDblClick);
    });
    hideSiteEditorToolbar();
}

function siteEditDblClick(e) {
    e.stopPropagation();
    const el = e.currentTarget;
    const proceed = confirm('Save this content back to the source HTML? You will be prompted for a file path and search selector.');
    if(!proceed) return;
    // Save flow
    saveEditedElement(el);
}

async function saveEditedElement(el) {
    const filePath = prompt('Enter target HTML file path in repo (e.g. projects.html):', window.location.pathname.replace(/^\//, '') || 'index.html');
    if(!filePath) return;
    // prefer existing id
    let selector = null;
    if(el.id) selector = `#${el.id}`;
    else selector = prompt('Enter a CSS selector to locate this element in the source HTML (e.g. .project-meta:nth-of-type(1))');
    if(!selector) return;

    try {
        const file = await fetchGHFile(filePath);
        let contentStr = JSON.stringify(file.data);
        // file.data is JSON when fetching via contents API for JSON; for HTML it will throw when parsing.
    } catch(e) {
        // fallback: fetch raw HTML
        try {
            const rawUrl = `https://raw.githubusercontent.com/${GH_REPO}/main/${filePath}`;
            const resp = await fetch(rawUrl);
            if(!resp.ok) throw new Error('Failed to fetch raw HTML');
            let html = await resp.text();
            // Simple replacement: find first occurrence of selector using DOMParser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const target = doc.querySelector(selector);
            if(!target) return alert('Selector not found in source file');
            target.innerHTML = el.innerHTML;
            const updatedHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
            // Commit updatedHtml back to repo
            const base64 = btoa(unescape(encodeURIComponent(updatedHtml)));
            const url = `https://api.github.com/repos/${GH_REPO}/contents/${filePath}`;
            const body = {
                message: `Site edit: update ${selector} on ${filePath}`,
                content: base64,
                branch: 'main'
            };
            const putResp = await fetch(url, {
                method: 'PUT',
                headers: { 'Authorization': `token ${GH_TOKEN}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if(!putResp.ok) throw new Error(await putResp.text());
            alert('Saved to ' + filePath + ' — give GitHub Pages a minute to rebuild.');
        } catch(err) { alert('Failed to save: ' + err.message); }
    }
}

function showSiteEditorToolbar() {
    let t = document.getElementById('site-editor-toolbar');
    if(t) return t.style.display = 'block';
    t = document.createElement('div');
    t.id = 'site-editor-toolbar';
    t.style.position = 'fixed';
    t.style.right = '12px';
    t.style.bottom = '12px';
    t.style.background = '#111';
    t.style.border = '1px solid #333';
    t.style.padding = '8px';
    t.style.zIndex = 9999;
    t.innerHTML = `<button id="site-editor-exit" style="background:#d4af37; border:none; padding:6px 8px; cursor:pointer;">Exit Site Editor</button>`;
    document.body.appendChild(t);
    document.getElementById('site-editor-exit').addEventListener('click', toggleSiteEditor);
}

function hideSiteEditorToolbar() {
    const t = document.getElementById('site-editor-toolbar');
    if(t) t.style.display = 'none';
}

async function deleteProject(index) {
    if(!confirm("Delete this project?")) return;
    
    try {
        const file = await fetchGHFile(PROJECTS_PATH);
        const projects = file.data;
        projects.splice(index, 1);
        await writeGHFile(PROJECTS_PATH, projects, file.sha, `Delete project index ${index}`);
        alert("Project Deleted! Reloading...");
        location.reload();
    } catch(e) {
        alert("Error deleting: " + e.message);
    }
}

window.deleteProject = deleteProject; 

// --- Blog Logic ---

async function initBlog() {
    const list = document.getElementById('blog-list');
    if(!list) return;

    try {
        const resp = await fetch('posts/index.json?t=' + Date.now());
        const posts = await resp.json();
        renderBlog(posts);
    } catch(e) { console.error(e); }
     
    // Bind existing admin button if handled in HTML, or add one
    const btn = document.getElementById('admin-trigger');
    if(btn) btn.addEventListener('click', authenticate);
    const siteBtn = document.getElementById('site-edit-trigger');
    if(siteBtn) siteBtn.addEventListener('click', toggleSiteEditor);
}

function renderBlog(posts) {
     const list = document.getElementById('blog-list');
     list.innerHTML = '';
     posts.forEach((post, index) => {
         const div = document.createElement('div');
         div.className = 'blog-item fade-in';
         div.style.marginBottom = '2rem';
         div.innerHTML = `
            <div style="font-size:0.8rem; color:#666;">${post.date}</div>
            <h3 style="margin: 0.5rem 0;"><a href="article.html?id=${post.id}" style="text-decoration:none; color:#e0e0e0; transition:color 0.2s;">${post.title}</a></h3>
            <p style="color:#aaa;">${post.summary}</p>
             <div class="admin-controls" style="display:none; margin-top:0.5rem; display:flex; gap:8px;">
                <button onclick="window.open('editor.html?id=${post.id}','_self')" style="background:#d4af37; color:#000; border:none; padding:5px 10px; cursor:pointer;">Edit</button>
                <button onclick="deletePost('${post.id}')" style="background:#ff4444; color:white; border:none; padding:5px 10px; cursor:pointer;">Delete Post</button>
            </div>
         `;
         list.appendChild(div);
     });
     if(isAdmin) renderAdminUI();
}

async function deletePost(id) {
    if(!confirm("Delete this post? Irreversible.")) return;
    try {
        // 1. Delete content file
        try {
            const file = await fetchGHFile(`posts/${id}.json`);
            await deleteGHFile(`posts/${id}.json`, file.sha, `Delete post ${id}`);
        } catch(e) { console.warn("Content file might not exist or already deleted", e); }

        // 2. Update Index
        const idxFile = await fetchGHFile(POSTS_Index_PATH);
        const posts = idxFile.data;
        const realIndex = posts.findIndex(p => p.id === id); 
        if(realIndex > -1) {
            posts.splice(realIndex, 1);
            await writeGHFile(POSTS_Index_PATH, posts, idxFile.sha, `Remove post ${id} from index`);
        }
        
        alert("Post deleted");
        location.reload();
    } catch(e) { alert("Error: " + e.message); }
}

async function deleteGHFile(path, sha, message) {
    const url = `https://api.github.com/repos/${GH_REPO}/contents/${path}`;
    const body = {
       message: message,
       sha: sha,
       branch: 'main'
   };
   const resp = await fetch(url, {
       method: 'DELETE',
       headers: { 
           'Authorization': `token ${GH_TOKEN}`, 
           'Content-Type': 'application/json' 
       },
       body: JSON.stringify(body)
   });
   if(!resp.ok) throw new Error(await resp.text());
}

window.deletePost = deletePost;

// Initialize
checkAutoLogin();
if(document.getElementById('projects-grid')) initProjects();
if(document.getElementById('blog-list')) initBlog();

