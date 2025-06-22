import*as h from"dompurify";import u from"markdown-it";var f=Object.freeze(["a","abbr","b","bdo","blockquote","br","caption","cite","code","col","colgroup","dd","del","details","dfn","div","dl","dt","em","figcaption","figure","h1","h2","h3","h4","h5","h6","hr","i","img","ins","kbd","label","li","mark","ol","p","pre","q","rp","rt","ruby","samp","small","small","source","span","strike","strong","sub","summary","sup","table","tbody","td","tfoot","th","thead","time","tr","tt","u","ul","var","video","wbr"]),b=Object.freeze(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","filter","font","g","glyph","glyphref","hkern","image","line","lineargradient","marker","mask","metadata","mpath","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),y={ALLOWED_TAGS:[...f,...b]},x=i=>{let t=new u({html:!0,linkify:!0,highlight:(e,n)=>n?`<div class="vscode-code-block" data-vscode-code-block-lang="${t.utils.escapeHtml(n)}">${t.utils.escapeHtml(e)}</div>`:t.utils.escapeHtml(e)});t.linkify.set({fuzzyLink:!1}),w(t),k(t);let l=document.createElement("style");l.textContent=`
		.emptyMarkdownCell::before {
			content: "${document.documentElement.style.getPropertyValue("--notebook-cell-markup-empty-content")}";
			font-style: italic;
			opacity: 0.6;
		}

		img {
			max-width: 100%;
			max-height: 100%;
		}

		a {
			text-decoration: none;
		}

		a:hover {
			text-decoration: underline;
		}

		a:focus,
		input:focus,
		select:focus,
		textarea:focus {
			outline: 1px solid -webkit-focus-ring-color;
			outline-offset: -1px;
		}

		hr {
			border: 0;
			height: 2px;
			border-bottom: 2px solid;
		}

		h2, h3, h4, h5, h6 {
			font-weight: normal;
		}

		h1 {
			font-size: 2.3em;
		}

		h2 {
			font-size: 2em;
		}

		h3 {
			font-size: 1.7em;
		}

		h3 {
			font-size: 1.5em;
		}

		h4 {
			font-size: 1.3em;
		}

		h5 {
			font-size: 1.2em;
		}

		h1,
		h2,
		h3 {
			font-weight: normal;
		}

		div {
			width: 100%;
		}

		/* Adjust margin of first item in markdown cell */
		*:first-child {
			margin-top: 0px;
		}

		/* h1 tags don't need top margin */
		h1:first-child {
			margin-top: 0;
		}

		/* Removes bottom margin when only one item exists in markdown cell */
		#preview > *:only-child,
		#preview > *:last-child {
			margin-bottom: 0;
			padding-bottom: 0;
		}

		/* makes all markdown cells consistent */
		div {
			min-height: var(--notebook-markdown-min-height);
		}

		table {
			border-collapse: collapse;
			border-spacing: 0;
		}

		table th,
		table td {
			border: 1px solid;
		}

		table > thead > tr > th {
			text-align: left;
			border-bottom: 1px solid;
		}

		table > thead > tr > th,
		table > thead > tr > td,
		table > tbody > tr > th,
		table > tbody > tr > td {
			padding: 5px 10px;
		}

		table > tbody > tr + tr > td {
			border-top: 1px solid;
		}

		blockquote {
			margin: 0 7px 0 5px;
			padding: 0 16px 0 10px;
			border-left-width: 5px;
			border-left-style: solid;
		}

		code {
			font-size: 1em;
			font-family: var(--vscode-editor-font-family);
		}

		pre code {
			line-height: 1.357em;
			white-space: pre-wrap;
			padding: 0;
		}

		li p {
			margin-bottom: 0.7em;
		}

		ul,
		ol {
			margin-bottom: 0.7em;
		}
	`;let d=document.createElement("template");return d.classList.add("markdown-style"),d.content.appendChild(l),document.head.appendChild(d),{renderOutputItem:(e,n)=>{let r;if(n.shadowRoot)r=n.shadowRoot.getElementById("preview");else{let o=n.attachShadow({mode:"open"}),c=document.getElementById("_defaultStyles");o.appendChild(c.cloneNode(!0));for(let a of document.getElementsByClassName("markdown-style"))a instanceof HTMLTemplateElement?o.appendChild(a.content.cloneNode(!0)):o.appendChild(a.cloneNode(!0));r=document.createElement("div"),r.id="preview",o.appendChild(r)}let s=e.text();if(s.trim().length===0)r.innerText="",r.classList.add("emptyMarkdownCell");else{r.classList.remove("emptyMarkdownCell");let o=e.mime.startsWith("text/x-")?`\`\`\`${e.mime.substr(7)}
${s}
\`\`\``:e.mime.startsWith("application/")?`\`\`\`${e.mime.substr(12)}
${s}
\`\`\``:s,c=t.render(o,{outputItem:e});r.innerHTML=i.workspace.isTrusted?c:h.sanitize(c,y)}},extendMarkdownIt:e=>{try{e(t)}catch(n){console.error("Error extending markdown-it",n)}}}};function w(i){let t=new Map,l=i.renderer.rules.heading_open;i.renderer.rules.heading_open=(e,n,r,s,o)=>{let c=e[n+1].children.reduce((m,g)=>m+g.content,""),a=p(c);if(t.has(a)){let m=t.get(a);t.set(a,m+1),a=p(a+"-"+(m+1))}else t.set(a,0);return e[n].attrSet("id",a),l?l(e,n,r,s,o):o.renderToken(e,n,r)};let d=i.render;i.render=function(){return t.clear(),d.apply(this,arguments)}}function k(i){let t=i.renderer.rules.link_open;i.renderer.rules.link_open=(l,d,e,n,r)=>{let s=l[d],o=s.attrGet("href");return typeof o=="string"&&o.startsWith("#")&&s.attrSet("href","#"+p(o.slice(1))),t?t(l,d,e,n,r):r.renderToken(l,d,e)}}function p(i){return encodeURI(i.trim().toLowerCase().replace(/\s+/g,"-").replace(/[\]\[\!\/\'\"\#\$\%\&\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\{\|\}\~\`。，、；：？！…—·ˉ¨‘’“”々～‖∶＂＇｀｜〃〔〕〈〉《》「」『』．〖〗【】（）［］｛｝]/g,"").replace(/^\-+/,"").replace(/\-+$/,""))}export{x as activate};
