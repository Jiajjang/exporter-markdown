(() => {
    "use strict";
    var e = {
            180: (e, t, r) => {
                (Object.defineProperty(t, "__esModule", { value: !0 }), (t.offset = t.contentTree = void 0));
                const n = r(111);
                ((t.contentTree = function (e, t, r) {
                    let o = new Array();
                    for (let t of e) {
                        let e = -2,
                            i = t.parent;
                        for (; i; ) (e++, (i = i.parent));
                        let u = e;
                        t.isRoot ||
                            (o.push({ title: t.title, url: (0, n.pageUrl)(t, r), offset: e, type: "group" }), (u += 1));
                        for (let e of t.children)
                            if ("Page" === e.type) {
                                let t = e;
                                o.push({ title: t.title, url: (0, n.pageUrl)(t, r), offset: u, type: "page" });
                            }
                    }
                    return o;
                }),
                    (t.offset = function (e, t, r) {
                        return e.repeat(t * r);
                    }));
            },
            87: (e, t) => {
                function r(e) {
                    let t = [];
                    for (let n of e.children)
                        "Page" === n.type ? t.push(n) : "Group" === n.type && (t = t.concat(r(n)));
                    return t;
                }
                (Object.defineProperty(t, "__esModule", { value: !0 }),
                    (t.previousPage =
                        t.nextPage =
                        t.flattenedPageStructure =
                        t.firstPageFromTop =
                        t.pageOrGroupActiveInContext =
                        t.firstSubgroupOfPage =
                            void 0),
                    (t.firstSubgroupOfPage = function (e) {
                        let t = e.parent;
                        for (;;) {
                            if (!t || t.isRoot) return;
                            if (t.parent && t.parent.isRoot) return t;
                            t = t.parent;
                        }
                    }),
                    (t.pageOrGroupActiveInContext = function e(t, r) {
                        if ("Page" === r.type) return r.id === t.id;
                        {
                            let n = r;
                            return -1 !== n.childrenIds.indexOf(t.persistentId) || (!!t.parent && e(t.parent, n));
                        }
                    }),
                    (t.firstPageFromTop = function e(t) {
                        for (let r of t.children) {
                            if ("Page" === r.type) return r;
                            {
                                let t = e(r);
                                if (t) return t;
                            }
                        }
                        return null;
                    }),
                    (t.flattenedPageStructure = r),
                    (t.nextPage = function (e, t) {
                        let n = r(t),
                            o = n.findIndex(t => t.id === e.id);
                        return -1 !== o && o < n.length - 1 ? n[o + 1] : null;
                    }),
                    (t.previousPage = function (e, t) {
                        let n = r(t),
                            o = n.findIndex(t => t.id === e.id);
                        return o > 0 ? n[o - 1] : null;
                    }));
            },
            111: (e, t, r) => {
                (Object.defineProperty(t, "__esModule", { value: !0 }),
                    (t.slugifyHeading = t.textBlockPlainText = t.assetUrl = t.rootUrl = t.pageUrl = void 0));
                const n = r(87);
                function o(e) {
                    return e.text.spans.map(e => e.text).join("");
                }
                function i(e) {
                    if (!e) return "";
                    e = (e = e.replace(/^\s+|\s+$/g, "")).toLowerCase();
                    for (var t = 0; t < 29; t++)
                        e = e.replace(
                            new RegExp("àáãäâèéëêìíïîòóöôùúüûñç·/_,:;".charAt(t), "g"),
                            "aaaaaeeeeiiiioooouuuunc------".charAt(t),
                        );
                    return e
                        .replace(/[^a-z0-9 -]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/-+/g, "-");
                }
                ((t.pageUrl = function (e, t) {
                    var r;
                    let o = null;
                    if (((o = "Page" === e.type ? e : (0, n.firstPageFromTop)(e)), !o)) return "";
                    let u = null !== (r = o.userSlug) && void 0 !== r ? r : o.slug,
                        a = [],
                        l = o.parent;
                    for (; l; ) (a.push(i(l.title)), (l = l.parent));
                    return (a.pop(), [t, ...a.reverse(), u].join("/") + ".md");
                }),
                    (t.rootUrl = function (e, t) {
                        return [t, e].join("/");
                    }),
                    (t.assetUrl = function (e, t) {
                        return [t, "assets", e].join("/");
                    }),
                    (t.textBlockPlainText = o),
                    (t.slugifyHeading = function (e) {
                        return "section-" + i(o(e)) + "-" + e.id.substring(0, 2);
                    }));
            },
        },
        t = {};
    function r(n) {
        var o = t[n];
        if (void 0 !== o) return o.exports;
        var i = (t[n] = { exports: {} });
        return (e[n](i, i.exports, r), i.exports);
    }
    (() => {
        const e = r(180),
            t = r(87),
            n = r(111);
        (Pulsar.registerFunction("pageUrl", n.pageUrl),
            Pulsar.registerFunction("pageOrGroupActiveInContext", t.pageOrGroupActiveInContext),
            Pulsar.registerFunction("firstPageFromTop", t.firstPageFromTop),
            Pulsar.registerFunction("contentTree", e.contentTree),
            Pulsar.registerFunction("offset", e.offset));
    })();
})();

// ---- Custom functions ----

Pulsar.registerFunction("slugify", function (text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
});

Pulsar.registerFunction("getPagePath", function (page) {
    function toSlug(text) {
        if (!text) return 'untitled';
        return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }

    // ONLY exclude true top-level section pages, not category groups
    const topLevelExcluded = ["home", "introduction", "foundations", "foundation", "release-notes"];

    const titleSlug = toSlug(page.title);

    // Walk up the full parent chain
    // Structure: Root > COMPONENTS > Content Navigations > Accordion
    let parents = [];
    let current = page.parent;
    while (current) {
        if (current.title && !current.isRoot) {
            parents.unshift(toSlug(current.title));
        }
        current = current.parent;
    }
    // parents = ["components", "content-navigations"] for Accordion

    // If page itself is a top-level excluded page
    if (topLevelExcluded.includes(titleSlug)) {
        return "_excluded/" + titleSlug + "-" + page.persistentId.substring(0, 6) + ".md";
    }

    // If the top-level parent is a section like "components" or "foundations", skip it
    // Use the second-level parent as the folder instead
    const topSection = parents[0]; // e.g. "components"
    const categoryFolder = parents[1]; // e.g. "content-navigations"

    if (categoryFolder) {
        // 3-level deep: docs/content-navigations/accordion.md
        return "docs/" + categoryFolder + "/" + titleSlug + ".md";
    } else if (topSection && !["components", "foundations", "foundation"].includes(topSection)) {
        // 2-level deep with non-excluded parent: docs/parent/page.md
        return "docs/" + topSection + "/" + titleSlug + ".md";
    } else {
        // Page is a category group itself (e.g. "Content Navigations") - exclude it
        return "_excluded/" + titleSlug + "-" + page.persistentId.substring(0, 6) + ".md";
    }
});

Pulsar.registerFunction("extractSection", function (markdown, sectionHeading) {
    const lines = markdown.split("\n");
    let capturing = false;
    let result = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (
            line.trim().toLowerCase() === ("# " + sectionHeading).toLowerCase() ||
            line.trim().toLowerCase() === ("## " + sectionHeading).toLowerCase()
        ) {
            capturing = true;
            result.push(line);
            continue;
        }

        if (capturing && /^#{1,2} /.test(line) && line !== result[0]) {
            break;
        }

        if (capturing) {
            result.push(line);
        }
    }

    return result.join("\n").trim();
});

Pulsar.registerFunction("cleanEntities", function (text) {
    return text
        .replace(/&hyphen;/g, "-")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ")
        .replace(/&semi;/g, ";")
        .replace(/&colon;/g, ":");
});
