var m=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(r,t)=>(typeof require<"u"?require:r)[t]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var a=import.meta.url.replace(/katex.js$/,"katex.min.css");async function k(e){let r=await e.getRenderer("vscode.markdown-it-renderer");if(!r)throw new Error("Could not load 'vscode.markdown-it-renderer'");let t=document.createElement("link");t.rel="stylesheet",t.classList.add("markdown-style"),t.href=a;let o=document.createElement("link");o.rel="stylesheet",o.href=a,document.head.appendChild(o);let d=document.createElement("style");d.textContent=`
		.katex-error {
			color: var(--vscode-editorError-foreground);
		}
		.katex-block {
			counter-reset: katexEqnNo mmlEqnNo;
		}
	`;let n=document.createElement("template");n.classList.add("markdown-style"),n.content.appendChild(d),n.content.appendChild(t),document.head.appendChild(n);let l=m("@vscode/markdown-it-katex").default,s={};r.extendMarkdownIt(c=>c.use(l,{globalGroup:!0,enableBareBlocks:!0,enableFencedBlocks:!0,macros:s}))}export{k as activate};
