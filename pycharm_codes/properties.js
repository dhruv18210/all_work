/* properties.js — page-specific JavaScript for the properties listing page
   (views/properties/list.php). PHP-derived config is injected inline via
   window._propCfg before this file is loaded. */

// Replacement for the legacy ajax_paging(): commonlist.js calls this both
// (a) after a row-action POST succeeds (Click to Mark Property, Verify,
// etc.) and (b) when the filter Search button is clicked. We hand control
// to DataTables — the table re-fetches via its serverSide ajax, with the
// new searchfield/searchval values forwarded by ajax.data.
function ajax_paging(_url) {
  if (window._appDataTable) {
    window._appDataTable.ajax.reload(null, false);
  }
  return false;
}

if (typeof setAvailabilityColor === "function") setAvailabilityColor();
if (typeof setReqPropertyColor === "function") setReqPropertyColor();
if (typeof icheckRadio === "function") icheckRadio();
if (typeof icheckCheckbox === "function") icheckCheckbox();

// Side-panel theme by property type: a distinct icon + accent colour per
// category (home → residential, building → commercial, map → plot / land).
// Colours are applied inline (not via Tailwind classes) so they render
// regardless of how the stylesheet is compiled/purged.
function sidePanelTypeTheme(typeText) {
  var HOME = "m3 12 9-9 9 9M5 10v10h4v-6h6v6h4V10";
  var t = String(typeText || "").toLowerCase();
  if (/commerc|office|shop|showroom|godown|warehouse|industrial|factory/.test(t)) {
    return {
      color: "#d97706",
      tint: "rgba(217,119,6,0.10)",
      ring: "#fde68a",
      icon:
        "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21",
    };
  }
  if (/plot|land|ploting|plotting|farm|agricultur/.test(t)) {
    return {
      color: "#7c3aed",
      tint: "rgba(124,58,237,0.10)",
      ring: "#ddd6fe",
      icon:
        "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z",
    };
  }
  // Residential (and default) → home, emerald.
  return {
    color: "#059669",
    tint: "rgba(5,150,105,0.10)",
    ring: "#a7f3d0",
    icon: HOME,
  };
}

$(function () {
  var isMobileView = window._propCfg.isMobileView;
  var _mobileColMap = window._propCfg.mobileColMap;
  var w = $(window);
  if ($(".desc").length) {
    var left1 = $(".desc").offset().left;
    if (left1 > w.width() - 200) $("#proplistdiv").scrollLeft(left1);
  }

  // Vanilla-JS modal handlers (Bootstrap JS is stripped on modern pages).
  $(document).on("click", '[data-toggle="modal"]', function () {
    var sel = $(this).attr("data-target");
    if (!sel) return;
    $(sel).addClass("in");
  });
  $(document).on(
    "click",
    '.modal [data-dismiss="modal"], .modal',
    function (e) {
      if (e.target !== this && !$(e.target).is('[data-dismiss="modal"]'))
        return;
      $(this).closest(".modal").removeClass("in");
    },
  );

  // Filter toggle (collapsed by default).
  $("#toggleFilterBtn").on("click", function () {
    var $row = $("#filterRow");
    var $chev = $("#toggleFilterChevron");
    var open = $row.toggleClass("hidden").is(":visible");
    $(this).attr("aria-expanded", open ? "true" : "false");
    if ($chev.length) $chev.css("transform", open ? "rotate(180deg)" : "");
  });

  // Zoom toggle: hides site header / footer / page title / legend so
  // the data table fills the viewport. CSS does the layout work; we
  // just toggle a body class and re-measure DataTables column widths.
  var zoomBtnDefaultClass =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition";
  var zoomBtnExitClass =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 transition";

  function setZoomState(zoom) {
    $("body").toggleClass("table-zoomed", zoom);
    if (zoom) {
      // Entering zoom locks scroll via body { overflow: hidden }. If the
      // user had scrolled past the action-row, the row would be frozen
      // above the viewport — pin to top so the top buttons are always
      // reachable in zoom view.
      window.scrollTo(0, 0);
    }
    $("#toggleZoomBtn")
      .attr("class", zoom ? zoomBtnExitClass : zoomBtnDefaultClass)
      .attr("aria-pressed", zoom ? "true" : "false")
      .attr("title", zoom ? "Exit zoom (Esc)" : "Zoom table to fullscreen");
    $("#zoomBtnLabel").text(zoom ? "Exit zoom" : "Zoom");
    var iconPath = zoom
      ? "M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"
      : "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5";
    $("#zoomBtnIcon").html(
      '<path stroke-linecap="round" stroke-linejoin="round" d="' +
        iconPath +
        '"/>',
    );
    if (window._appDataTable) {
      setTimeout(function () {
        window._appDataTable.columns.adjust();
      }, 60);
    }
  }
  $("#toggleZoomBtn").on("click", function () {
    setZoomState(!$("body").hasClass("table-zoomed"));
  });
  $(document).on("keydown", function (e) {
    if (e.key === "Escape" && $("body").hasClass("table-zoomed")) {
      setZoomState(false);
    }
  });

  // Side detail panel: opens an aside next to the table; clicking a
  // row populates it with hero metadata + iconned field cards built
  // from every visible column. Toggling the panel changes the table
  // width, so re-measure DataTables after every state change.
  var SIDE_EMPTY_HTML =
    '<div data-side-empty class="h-full flex flex-col items-center justify-center px-6 py-12 text-center">' +
    '<div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-emerald-50 ring-1 ring-indigo-100 inline-flex items-center justify-center mb-4">' +
    '<svg class="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9h6m-6 4h4"/></svg>' +
    "</div>" +
    '<p class="text-sm font-semibold text-slate-700">No row selected</p>' +
    '<p class="text-xs text-slate-500 mt-1.5 max-w-[16rem]">Click any row in the table to view all of its details right here.</p>' +
    "</div>";

  // Inner SVG path mapped by header keyword. First match wins.
  var SIDE_PANEL_ICONS = [
    {
      test: /verified/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z"/>',
    },
    {
      test: /property\s*id|^\s*id\s*$/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h10"/>',
    },
    {
      test: /property\s*type|^\s*type\s*$/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="m3 12 9-9 9 9M5 10v10h4v-6h6v6h4V10"/>',
    },
    {
      test: /date/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3M16 7V3M3 11h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/>',
    },
    {
      test: /broker|estate|contact|^name$|owner/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0"/>',
    },
    {
      test: /premise|address|landmark/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>',
    },
    {
      test: /area/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M3 12h18M3 18h18M7 3v18M17 3v18"/>',
    },
    {
      test: /value|^price$|^rate$/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v8m4-6h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>',
    },
    {
      test: /availab/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 12l5 5L20 7"/>',
    },
    {
      test: /condition/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 3h7l9 9-9 9-9-9V5a2 2 0 0 1 2-2Zm2 4h.01"/>',
    },
    {
      test: /description|amenit|propdesc/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M5 5h14v14H5zM9 9h6M9 13h6M9 17h4"/>',
    },
    {
      test: /detail|comment|note/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"/>',
    },
    {
      test: /sqfeet|^size$|sqft|sq\.?ft/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 4h16v16H4zM4 9h5M4 14h3M9 4v5M14 4v3M20 9h-5M20 14h-3M9 20v-5M14 20v-3"/>',
    },
    {
      test: /source/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12h12m0 0-4-4m4 4-4 4M21 6v12"/>',
    },
    {
      test: /matching/i,
      svg: '<path stroke-linecap="round" stroke-linejoin="round" d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14ZM21 21l-4.35-4.35"/>',
    },
  ];

  function iconForLabel(label) {
    for (var i = 0; i < SIDE_PANEL_ICONS.length; i++) {
      if (SIDE_PANEL_ICONS[i].test.test(label)) return SIDE_PANEL_ICONS[i].svg;
    }
    return '<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 3h.01M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Z"/>';
  }

  function escapeHtml(s) {
    // NOTE: jQuery's .text().html() escapes < > & but NOT quotes. This value
    // is used inside a data-full-html="..." attribute, so unescaped double
    // quotes in the cell HTML (e.g. a trigger's onclick="...") would terminate
    // the attribute early and leak inner attributes (onclick, data-toggle) onto
    // the wrapper element — causing e.g. the matching-requirement modal to open
    // twice. Escape quotes too so the attribute value is always safe.
    return $("<div>")
      .text(String(s == null ? "" : s))
      .html()
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function stripHtml(html) {
    return $("<div>")
      .html(String(html == null ? "" : html))
      .text()
      .replace(/\s+/g, " ")
      .trim();
  }

  function findExpandableColumnTargets() {
    var targets = [];
    $("#list thead th").each(function (i) {
      var label = $(this).text().replace(/\s+/g, " ").trim();
      if (
        /^(landmark|property\s+description|property\s+details?|matching\s+requirement)$/i.test(
          label,
        )
      ) {
        targets.push(i);
      }
    });
    return targets;
  }

  function addExpandableColumnTarget(targets, idx) {
    idx = parseInt(idx, 10);
    if (!isNaN(idx) && idx >= 0 && $.inArray(idx, targets) === -1) {
      targets.push(idx);
    }
  }

  function renderExpandableCell(data, type) {
    if (type !== "display") return data;
    var html = String(data == null ? "" : data);
    var text = stripHtml(html);
    var limit = 56;
    if (text.length <= limit) {
      return (
        '<div class="dt-expandable-text dt-expandable-text-short" data-full-html="' +
        escapeHtml(html) +
        '">' +
        html +
        "</div>"
      );
    }

    var shortText = text.slice(0, limit).replace(/\s+\S*$/, "");
    if (shortText.length < 30) shortText = text.slice(0, limit);

    return (
      '<div class="dt-expandable-text" data-full-html="' +
      escapeHtml(html) +
      '">' +
      '<span class="dt-text-short">' +
      escapeHtml(shortText) +
      "&hellip;</span>" +
      '<span class="dt-text-full hidden">' +
      html +
      "</span> " +
      '<button type="button" class="dt-read-toggle" data-expanded="false">read more</button>' +
      "</div>"
    );
  }

  function wrapExpandableTableCells(targets) {
    if (!targets || !targets.length) return;
    $("#list tbody tr").each(function () {
      var $cells = $(this).children("td");
      targets.forEach(function (idx) {
        var $cell = $cells.eq(idx);
        if (!$cell.length || $cell.find(".dt-expandable-text").length) return;
        var html = ($cell.html() || "").trim();
        if (!html) return;
        $cell.html(renderExpandableCell(html, "display"));
      });
    });
  }

  function collapseExpandableTableCells() {
    $("#list .dt-expandable-text").each(function () {
      var $wrap = $(this);
      $wrap.find(".dt-text-short").removeClass("hidden");
      $wrap.find(".dt-text-full").addClass("hidden");
      $wrap
        .find(".dt-read-toggle")
        .attr("data-expanded", "false")
        .text("read more");
    });
  }

  $(document).on("click", "#list .dt-read-toggle", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (!$("body").hasClass("side-panel-open")) {
      var $btn = $(this);
      var expanded = $btn.attr("data-expanded") === "true";
      var $wrap = $btn.closest(".dt-expandable-text");
      $wrap.find(".dt-text-short").toggleClass("hidden", !expanded);
      $wrap.find(".dt-text-full").toggleClass("hidden", expanded);
      $btn
        .attr("data-expanded", expanded ? "false" : "true")
        .text(expanded ? "read more" : "read less");
      adjustDtSoon();
    }
  });

  // Builds the Shortlist / WhatsApp / Bookmark toolbar from the row's
  // own action anchors. Each toolbar button is a styled wrapper that
  // re-finds the live anchor at click time and forwards the click —
  // re-finding matters because some actions (shortlist) trigger a
  // DataTable redraw, which detaches the original anchor and would
  // leave a cached jQuery reference pointing at a dead node.
  function buildActionToolbar($row) {
    function extractRecId($scope, prefixes) {
      for (var i = 0; i < prefixes.length; i++) {
        var $m = $scope.find('[id^="' + prefixes[i] + '"]').first();
        if ($m.length) {
          var id = $m.attr("id") || "";
          return {
            recId: id.slice(prefixes[i].length),
            stateIdx: i,
          };
        }
      }
      return null;
    }
    var sl = extractRecId($row, ["isFeatureUserId_", "isFeaturedUserId_"]); // 0 unsaved, 1 saved
    var wa = extractRecId($row, ["whatsapplink_prop_"]);
    var mk = extractRecId($row, [
      "isPropNotAvailableId_",
      "isPropAvailableId_",
    ]); // 0 available, 1 unavailable
    var $restoreAnchor = $row.find('a[href*="/restore?id="]').first();

    var SHORTLIST_STATES = [
      {
        label: "Shortlist",
        tooltip: "Click to Shortlist",
        tone: "neutral",
        icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 4h12v17l-6-4-6 4V4z"/>',
      },
      {
        label: "Shortlisted",
        tooltip: "Click to Remove Shortlist",
        tone: "sky",
        icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M6 4h12v17l-6-4-6 4V4z" fill="currentColor"/>',
      },
    ];
    var AVAILABILITY_STATES = [
      {
        label: "Report",
        tone: "amber-soft",
        icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 21V4m0 0h12.5l-2 4 2 4H4"/>',
      },
      {
        label: "Reported",
        tone: "rose-active",
        icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M4 21V4m0 0h12.5l-2 4 2 4H4" fill="currentColor"/>',
      },
    ];
    var WHATSAPP_STATES = [
      {
        label: "WhatsApp",
        tone: "green",
        icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M20.5 11.5a8.5 8.5 0 0 1-12.7 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 20.5 11.5Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 9.2c.2 2.7 2.4 4.9 5.1 5.1l1-1.3-2-1-.9.9c-.7-.2-1.4-.9-1.6-1.6l.9-.9-1-2L9 9.2Z"/>',
      },
    ];
    var RESTORE_STATES = [
      {
        label: "Restore",
        tone: "indigo",
        icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 12a9 9 0 0 1 15.5-6.4L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.4L3 16M3 21v-5h5"/>',
      },
    ];

    var actions = [];
    if (mk) {
      actions.push({
        stateIdx: mk.stateIdx,
        states: AVAILABILITY_STATES,
        selectors: [
          "#isPropNotAvailableId_" + mk.recId,
          "#isPropAvailableId_" + mk.recId,
        ],
        startEvent: "kaizen:availabilityActionStart",
        waitForEvent: "kaizen:availabilityActionComplete",
      });
    }
    if (sl) {
      actions.push({
        stateIdx: sl.stateIdx,
        states: SHORTLIST_STATES,
        selectors: [
          "#isFeatureUserId_" + sl.recId,
          "#isFeaturedUserId_" + sl.recId,
        ],
        startEvent: "kaizen:shortlistActionStart",
        waitForEvent: "kaizen:shortlistActionComplete",
      });
    }
    if (wa) {
      actions.push({
        stateIdx: 0,
        states: WHATSAPP_STATES,
        selectors: ["#whatsapplink_prop_" + wa.recId],
      });
    }
    if ($restoreAnchor.length) {
      actions.push({
        stateIdx: 0,
        states: RESTORE_STATES,
        node: $restoreAnchor[0],
      });
    }
    if (!actions.length) return null;

    var TONE = {
      amber: "bg-amber-500 text-white ring-amber-400 hover:bg-amber-600",
      "amber-active":
        "bg-amber-500 text-white ring-amber-400 hover:bg-amber-600",
      "amber-soft": "bg-amber-500 text-white ring-amber-400 hover:bg-amber-600",
      green: "bg-emerald-500 text-white ring-emerald-400 hover:bg-emerald-600",
      rose: "bg-rose-500 text-white ring-rose-400 hover:bg-rose-600",
      "rose-active": "bg-rose-500 text-white ring-rose-400 hover:bg-rose-600",
      sky: "bg-sky-500 text-white ring-sky-400 hover:bg-sky-600",
      neutral:
        "bg-white text-slate-900 ring-slate-300 hover:bg-slate-50 hover:ring-slate-400",
      indigo: "bg-indigo-500 text-white ring-indigo-400 hover:bg-indigo-600",
    };
    var BTN_BASE =
      "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ring-1 text-xs font-semibold transition flex-1 justify-center min-w-0 shadow-sm";

    function paintBtn($btn, state) {
      $btn
        .attr("class", BTN_BASE + " " + TONE[state.tone])
        .attr("title", state.tooltip || state.label)
        .attr("data-tooltip", state.tooltip || state.label)
        .prop("disabled", false)
        .removeAttr("aria-busy")
        .empty()
        .append(
          '<svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">' +
            state.icon +
            "</svg>",
        )
        .append($('<span class="truncate"></span>').text(state.label));
    }

    function paintLoadingBtn($btn) {
      $btn
        .attr(
          "class",
          BTN_BASE +
            " bg-slate-100 text-slate-500 ring-slate-200 cursor-wait opacity-80",
        )
        .prop("disabled", true)
        .attr("aria-busy", "true")
        .empty()
        .append(
          '<svg class="w-4 h-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" d="M12 3a9 9 0 1 1-8.5 6"/></svg>',
        )
        .append($('<span class="truncate"></span>').text("Updating"));
    }

    function stateIdxFromCurrentId(action, currentId) {
      var currentSelector = currentId ? "#" + currentId : "";
      var idx = $.inArray(currentSelector, action.selectors);
      return idx >= 0 ? idx : action.stateIdx;
    }

    var $bar = $(
      '<div class="px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap gap-2"></div>',
    );
    actions.forEach(function (a) {
      var $btn = $('<button type="button"></button>');
      paintBtn($btn, a.states[a.stateIdx]);
      if (a.waitForEvent) {
        var ns = ".sideAction" + Date.now() + Math.floor(Math.random() * 1000);
        if (a.startEvent) {
          $(document).on(a.startEvent + ns, function (event, detail) {
            detail = detail || {};
            if ($.inArray("#" + detail.selectedId, a.selectors) === -1) return;
            paintLoadingBtn($btn);
          });
        }
        $(document).on(a.waitForEvent + ns, function (event, detail) {
          detail = detail || {};
          var previousSelector = detail.previousId
            ? "#" + detail.previousId
            : "";
          var currentSelector = detail.currentId ? "#" + detail.currentId : "";
          if (
            $.inArray(previousSelector, a.selectors) === -1 &&
            $.inArray(currentSelector, a.selectors) === -1
          )
            return;
          a.stateIdx = stateIdxFromCurrentId(a, detail.currentId);
          paintBtn($btn, a.states[a.stateIdx]);
        });
        $btn.on("remove", function () {
          $(document).off(ns);
        });
      }
      $btn.on("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        // Row-scoped action: click the captured anchor directly (e.g. the
        // per-row Restore link on the deleted listing, which has no
        // page-unique ID).
        if (a.node) {
          a.node.click();
          return;
        }
        // Re-find the live anchor against the current DOM. The
        // ID prefix flips when the action toggles state, so we
        // try each candidate selector in order.
        for (var i = 0; i < a.selectors.length; i++) {
          var $live = $(a.selectors[i]);
          if ($live.length) {
            $live[0].click(); // native click → bubbles to body delegated handlers
            if (a.states.length > 1 && !a.waitForEvent) {
              a.stateIdx = a.stateIdx === 1 ? 0 : 1;
              paintBtn($btn, a.states[a.stateIdx]);
            }
            return;
          }
        }
      });
      $bar.append($btn);
    });
    return $bar;
  }

  function adjustDtSoon() {
    if (window._appDataTable) {
      setTimeout(function () {
        window._appDataTable.columns.adjust();
      }, 60);
    }
  }

  function isMobileDetailMode() {
    return (
      window.matchMedia && window.matchMedia("(max-width: 1023px)").matches
    );
  }
  var $sideSpanHome = $('<span data-side-span-home class="hidden"></span>');
  $("#sideSpanView").after($sideSpanHome);

  function placeSidePanelForViewport(open) {
    var $panel = $("#sideSpanView");
    if (!$panel.length) return;
    if (open && isMobileDetailMode()) {
      if (!$panel.parent().is("body")) $panel.detach().appendTo(document.body);
      return;
    }
    if ($sideSpanHome.parent().length && !$panel.next().is($sideSpanHome)) {
      $panel.detach().insertBefore($sideSpanHome);
    }
  }

  function setSpanState(open) {
    placeSidePanelForViewport(open);
    $("#sideSpanView").toggleClass("hidden", !open);
    // Body class drives the mobile bottom-sheet padding rule in
    // auth/_setup.php so the last table rows can scroll above the panel.
    $("body").toggleClass("side-panel-open", open);
    $("#toggleSpanBtn").attr("aria-pressed", open ? "true" : "false");
    if (open) {
      collapseExpandableTableCells();
    }
    if (!open) {
      $("#list tbody tr").removeClass("row-selected");
      $("#sideSpanBody").html(SIDE_EMPTY_HTML);
    }
    adjustDtSoon();
  }
  $("#toggleSpanBtn").on("click", function () {
    setSpanState($("#sideSpanView").hasClass("hidden"));
  });
  $("#closeSpanBtn").on("click", function () {
    setSpanState(false);
  });

  // Row click → render hero + iconned field cards into the side panel.
  // Delegated because rows are redrawn on every server-side fetch.
  $("#list tbody").on("click", "tr", function (e) {
    if (
      $(e.target).closest(
        "a, button, input, select, label, .checker, [data-toggle], [onclick]",
      ).length
    )
      return;
    if ($("#sideSpanView").hasClass("hidden")) {
      if (!isMobileDetailMode()) return;
      setSpanState(true);
    }
    var $row = $(this);
    if (!$row.children("td").length) return; // skip "no data" placeholder rows

    var headers = [];
    $("#list thead th").each(function () {
      headers.push($(this).text().replace(/\s+/g, " ").trim());
    });

    var fields = [];
    var heroId = "",
      heroType = "",
      heroValueHtml = "";
    $row.children("td").each(function (i) {
      var label = headers[i] || "";
      var $cell = $(this);
      var fullHtml = $cell.find("[data-full-html]").attr("data-full-html");
      var html = (fullHtml || $cell.html() || "").trim();
      var text = $cell.text().replace(/\s+/g, " ").trim();
      if (fullHtml) text = stripHtml(fullHtml);
      if (!label || /^(n\/?a|imp|action)$/i.test(label)) return; // skip action / placeholder cols
      if (!text && !html) return;

      var l = label.toLowerCase();
      if (!heroId && /property\s*id|^\s*id\s*$/.test(l)) {
        heroId = text;
        return;
      }
      if (!heroType && /property\s*type|^\s*type\s*$/.test(l)) {
        heroType = text;
        return;
      }
      if (!heroValueHtml && /^value$|^price$|^rate$/.test(l)) {
        heroValueHtml = html;
        return;
      }

      fields.push({
        label: label,
        html: html,
      });
    });

    var $body = $("#sideSpanBody").empty();

    // Theme the side-panel header icon (and the type chip below) by type.
    var sideTheme = sidePanelTypeTheme(heroType);
    $("#sideSpanIconWrap").css({
      "background-color": sideTheme.tint,
      color: sideTheme.color,
      "box-shadow": "inset 0 0 0 1px " + sideTheme.ring,
    });
    $("#sideSpanIcon").html(
      '<path stroke-linecap="round" stroke-linejoin="round" d="' +
        sideTheme.icon +
        '"/>',
    );

    if (heroId || heroType || heroValueHtml) {
      var heroParts = [];
      heroParts.push(
        '<div class="px-5 py-4 bg-gradient-to-br from-indigo-50 via-white to-emerald-50/60 border-b border-slate-200">',
      );
      heroParts.push('<div class="flex items-start justify-between gap-3">');
      heroParts.push('<div class="min-w-0 flex-1">');
      if (heroType)
        heroParts.push(
          '<span class="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-white text-[11px] font-semibold" style="color:' +
            sideTheme.color +
            ";box-shadow:inset 0 0 0 1px " +
            sideTheme.ring +
            ';">' +
            escapeHtml(heroType) +
            "</span>",
        );
      heroParts.push("</div>");
      if (heroValueHtml) {
        heroParts.push('<div class="text-right shrink-0 pl-2">');
        heroParts.push(
          '<p class="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Value</p>',
        );
        heroParts.push(
          '<div class="text-base font-bold text-emerald-700">' +
            heroValueHtml +
            "</div>",
        );
        heroParts.push("</div>");
      }
      heroParts.push("</div></div>");
      $body.append(heroParts.join(""));
    }

    var $actionBar = buildActionToolbar($row);
    if ($actionBar) $body.append($actionBar);

    var $list = $('<div class="px-3 py-3 space-y-2"></div>');
    fields.forEach(function (f) {
      var $card = $(
        '<div class="group relative rounded-xl bg-white ring-1 ring-slate-200/70 px-3 py-2.5 hover:ring-indigo-300 hover:shadow-sm transition">' +
          '<div class="flex items-start gap-2.5">' +
          '<span class="mt-0.5 w-7 h-7 rounded-lg bg-slate-100 text-slate-500 inline-flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">' +
          '<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">' +
          iconForLabel(f.label) +
          "</svg>" +
          "</span>" +
          '<div class="min-w-0 flex-1">' +
          '<p data-side-label class="text-[10px] font-semibold uppercase tracking-wider text-slate-500"></p>' +
          '<div data-side-value class="mt-0.5 text-[13px] text-slate-800 break-words leading-snug"></div>' +
          "</div>" +
          "</div>" +
          "</div>",
      );
      $card.find("[data-side-label]").text(f.label);
      $card.find("[data-side-value]").html(f.html);
      $list.append($card);
    });
    $body.append($list);
    $body.scrollTop(0);

    $("#list tbody tr").removeClass("row-selected");
    $row.addClass("row-selected");
  });

  // Inline status edit (preserved from legacy view).
  $("td.editable").click(function (e) {
    if ($("#inlinestatussave").length === 0) {
      e.stopPropagation();
      updateVal(this, $(this).html());
    }
  });

  // DataTables 2.x layout: page-length on top-left, pagination on
  // top-right AND bottom-right, "Showing X to Y of Z" on the bottom-left.
  var dtLayout = window.kaizenDataTableLayout
    ? window.kaizenDataTableLayout()
    : {
        topStart: "pageLength",
        topEnd: "paging",
        bottomStart: "info",
        bottomEnd: "paging",
      };

  // All listings use server-side DataTables — pagination, sort, and
  // length make POST requests back to /properties/listing/<segment>;
  // the controller detects the 'draw' POST param and returns JSON
  // instead of rendering the view.
  // Area column index — used to tag with .locationcell so the area
  // cell renders with the legacy gray background. The All listing
  // merges its two leading action columns into one, shifting
  // everything left by one slot.
  var isAllListing = window._propCfg.isAllListing;
  var areaColIdx = window._propCfg.areaColIdx;

  // columnDefs: tag the area column for legacy gray background, and
  // tag the action column with `actions-tip` so the tooltip JS finds
  // it. The All listing additionally tags col 0 with `actions-col`
  // for the sticky-freeze CSS.
  var columnDefs = [
    {
      className: "locationcell",
      width: "12rem",
      targets: [areaColIdx],
    },
  ];
  var expandableColumnTargets = findExpandableColumnTargets();
  addExpandableColumnTarget(
    expandableColumnTargets,
    window._propCfg.landmarkColIdx,
  );
  if (expandableColumnTargets.length) {
    columnDefs.push({
      className: "dt-expandable-col",
      targets: expandableColumnTargets,
    });
  }
  if (isAllListing) {
    columnDefs.push({
      className: "actions-col actions-tip",
      targets: [0],
    });
  } else {
    // Non-All listings: col 0 is the delete-checkbox, col 1 is the
    // Action button group. Tag col 1 so its buttons get tooltips.
    columnDefs.push({
      className: "actions-tip",
      targets: [1],
    });
  }

  if (!isMobileView) {
    window._appDataTable = new DataTable("#list", {
      layout: dtLayout,
      serverSide: true,
      processing: true,
      searching: false,
      ordering: false,
      scrollX: true,
      scrollY: window.kaizenDataTableScrollY
        ? window.kaizenDataTableScrollY("calc(100vh - 9rem)")
        : "calc(100vh - 9rem)",
      scrollCollapse: window.kaizenDataTableScrollCollapse
        ? window.kaizenDataTableScrollCollapse()
        : true,
      autoWidth: false,
      columnDefs: columnDefs,
      lengthMenu: [
        [50, 100, 200],
        [50, 100, 200],
      ],
      pageLength: 50,
      ajax: {
        url: window._propCfg.currentUrl,
        type: "POST",
        data: function (d) {
          // Forward filter values populated by commonlist.js's
          // checkIdExists() loop when Search is clicked.
          d.searchfield = $("#searchfield").text();
          d.searchval = $("#searchval").text();
          d.searchbybroker = $("#searchbybroker").text();
        },
      },
    });

    // After every server-side draw, re-apply the legacy cell-tint classes
    // to the property-type / availability / condition columns based on
    // their text content. Without this they stay plain white. Tooltip
    // promotion (title → data-tooltip) is handled globally by
    // js/modern-actions-tooltip.js, scoped to td.actions-tip cells.
    window._appDataTable.on("draw.dt", function () {
      wrapExpandableTableCells(expandableColumnTargets);
      if (typeof setReqPropertyColor === "function") setReqPropertyColor();
      if (typeof setAvailabilityColor === "function") setAvailabilityColor();
    });

    // Custom loader overlay anchored to #proplistdiv. Shows a centered
    // card with a spinner + a random Hindi/Gujarati/English phrase on
    // every server-side fetch (including the initial load), with a min
    // visibility window so fast responses don't flash invisibly.
    if (window.modernDtLoader) {
      window.modernDtLoader.attach(window._appDataTable, "#proplistdiv");
    }

    // Re-sync scroll-head ↔ scroll-body column widths whenever the
    // table state changes. With scrollX + scrollY DataTables splits the
    // header and body into two tables and they can desync if any cell's
    // measured width differs from the header's natural width.
    if (window._appDataTable) {
      var _adj = function () {
        window._appDataTable.columns.adjust();
      };
      window._appDataTable.on("init.dt draw.dt xhr.dt", _adj);
      $(window).on("resize", _adj);
      // Run once after DOM settles.
      setTimeout(_adj, 50);
    }
  } else {
    // ── Mobile: render as Tailwind cards via the same server-side AJAX endpoint ──
    var _mcStart = 0,
      _mcTotal = 0,
      _mcLoading = false,
      _mcSeq = 0,
      _mcLength = 20;

    function _mcCard(row) {
      // Delegate to the shared renderer (js/property-card.js).
      return window.kaizenRenderPropertyCard(row, _mobileColMap, _mcSeq++);
    }

    // "Load more" button \u2014 swap its label for a spinner while the next page
    // is in flight, and disable clicks so they can't queue up.
    var _mcLoadMoreOriginalLabel = "Load more";
    function _mcLoadMoreSetLoading() {
      var $btn = $("#mobileCardLoadMore");
      if (!$btn.length) return;
      var current = $btn.text().trim();
      if (current) _mcLoadMoreOriginalLabel = current;
      $btn
        .prop("disabled", true)
        .css({ cursor: "wait", opacity: 0.85 })
        .html(
          '<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" d="M12 3a9 9 0 1 1-8.5 6"/></svg>' +
            "<span>Loading\u2026</span>",
        );
    }
    function _mcLoadMoreRestore(label) {
      var $btn = $("#mobileCardLoadMore");
      if (!$btn.length) return;
      $btn
        .prop("disabled", false)
        .css({ cursor: "", opacity: "" })
        .text(label || _mcLoadMoreOriginalLabel);
    }

    function _mcFetch(reset) {
      if (_mcLoading) return;
      _mcLoading = true;
      if (reset) {
        _mcStart = 0;
        $("#mobileCardList").html(
          '<div id="mobileCardLoading" class="py-12 flex flex-col items-center gap-3 text-slate-500">' +
            '<svg class="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" d="M12 3a9 9 0 1 1-8.5 6"/></svg>' +
            '<span class="text-sm">Loading properties\u2026</span></div>',
        );
      } else {
        _mcLoadMoreSetLoading();
      }
      $.ajax({
        url: window._propCfg.currentUrl,
        type: "POST",
        data: {
          draw: 1,
          start: _mcStart,
          length: _mcLength,
          searchfield: $("#searchfield").text(),
          searchval: $("#searchval").text(),
          searchbybroker: $("#searchbybroker").text(),
        },
        success: function (resp) {
          $("#mobileCardLoading").remove();
          _mcTotal = resp.recordsFiltered || resp.recordsTotal || 0;
          var rows = resp.data || [],
            frag = "";
          for (var ri = 0; ri < rows.length; ri++) frag += _mcCard(rows[ri]);
          $("#mobileCardList").append(frag);
          _mcStart += rows.length;
          var rem = _mcTotal - _mcStart;
          if (rem > 0) {
            $("#mobileCardPager").removeClass("hidden");
            _mcLoadMoreRestore("Load more (" + rem + " remaining)");
          } else {
            $("#mobileCardPager").addClass("hidden");
            _mcLoadMoreRestore();
          }
          // Show More / Show Less toggle handler (shared, idempotent).
          if (typeof window.kaizenWirePropertyCardToggle === "function") {
            window.kaizenWirePropertyCardToggle();
          }
          _mcLoading = false;
        },
        error: function () {
          _mcLoading = false;
          _mcLoadMoreRestore();
          $("#mobileCardLoading").html(
            '<p class="text-sm text-rose-500 text-center py-6">Failed to load. Refresh to retry.</p>',
          );
        },
      });
    }

    // ajax_paging is called by commonlist.js after row-actions (mark, report, etc.)
    // AND after the search button. We only want to reload for search.
    // Use a flag set by the search button click to tell them apart.
    window._mcSearchRequested = false;
    $(document).on("click", "#listAdvSearch", function () {
      window._mcSearchRequested = true;
    });
    window.ajax_paging = function (_url) {
      if (window._mcSearchRequested) {
        window._mcSearchRequested = false;
        _mcFetch(true);
      }
      // Row-action calls (mark, feature, etc.) arrive here with _mcSearchRequested=false
      // — button state already toggled by commonlist.js, nothing else to do.
      return false;
    };
    $("#mobileCardLoadMore").on("click", function () {
      _mcFetch(false);
    });
    _mcFetch(true);
  } // end if (!isMobileView) ... else
});

function updateVal(currentEle, value) {
  var data = {
    0: "--BLANK--",
    1: "Available",
    2: "Rented Out",
  };
  var curstatus = $(currentEle).attr("currentstatus");
  var arr = $(currentEle).attr("class").split(" ");
  var s = $(
    '<select class="thVal form-control input-sm" name="editstatus" id="editstatus" />',
  );
  for (var val in data) {
    if (val == curstatus) {
      $("<option />", {
        value: val,
        text: data[val],
      })
        .attr("selected", "selected")
        .appendTo(s);
    } else {
      $("<option />", {
        value: val,
        text: data[val],
      }).appendTo(s);
    }
  }
  $(currentEle).html(s);
  $("#editstatus").focus();
  $(currentEle).append(
    "<span id='inlinestatussave' class='fa fa-save text-success'></span>",
  );
  $(".thVal", currentEle)
    .focus()
    .keyup(function (event) {
      if (event.keyCode == 13) $(currentEle).html($(".thVal").val().trim());
    })
    .click(function (e) {
      e.stopPropagation();
    });

  $("#inlinestatussave").click(function () {
    var ajaxURL = $(location)
      .attr("href")
      .replace("listing", "ajaxstatusupdate");
    $.ajax({
      type: "POST",
      url: ajaxURL,
      data: {
        statusval: $(".thVal").val(),
        propid: arr[2],
      },
      success: function (data) {
        $(currentEle).html(data);
      },
    });
  });
}

// Shared "read more / read less" clamp for the matching modals, mirroring the
// main listing's expandable cells. Guarded so it's defined only once even if
// both page scripts ship a copy.
if (!window.kaizenModalClamp) {
  window.kaizenModalClamp = function (tableSel, headerRe, limit) {
    limit = limit || 72;
    var esc = function (s) {
      return $("<div>")
        .text(String(s == null ? "" : s))
        .html();
    };
    var strip = function (h) {
      return $("<div>")
        .html(String(h == null ? "" : h))
        .text()
        .replace(/\s+/g, " ")
        .trim();
    };
    var targets = [];
    $(tableSel + " thead th").each(function (i) {
      if (headerRe.test($(this).text().replace(/\s+/g, " ").trim()))
        targets.push(i);
    });
    if (!targets.length) return;
    $(tableSel + " tbody tr").each(function () {
      var $tds = $(this).children("td");
      targets.forEach(function (idx) {
        var $c = $tds.eq(idx);
        if (!$c.length || $c.find(".dt-expandable-text").length) return;
        var html = ($c.html() || "").trim();
        if (!html) return;
        var text = strip(html);
        if (text.length <= limit) {
          $c.html('<div class="dt-expandable-text">' + html + "</div>");
          return;
        }
        var shortText = text.slice(0, limit).replace(/\s+\S*$/, "");
        if (shortText.length < 40) shortText = text.slice(0, limit);
        $c.html(
          '<div class="dt-expandable-text">' +
            '<span class="dt-text-short">' +
            esc(shortText) +
            "&hellip;</span>" +
            '<span class="dt-text-full hidden">' +
            html +
            "</span> " +
            '<button type="button" class="dt-read-toggle" data-expanded="false">read more</button>' +
            "</div>",
        );
      });
    });
  };
  $(document).on("click", ".modal .dt-read-toggle", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $btn = $(this),
      expanded = $btn.attr("data-expanded") === "true",
      $w = $btn.closest(".dt-expandable-text");
    $w.find(".dt-text-short").toggleClass("hidden", !expanded);
    $w.find(".dt-text-full").toggleClass("hidden", expanded);
    $btn
      .attr("data-expanded", expanded ? "false" : "true")
      .text(expanded ? "read more" : "read less");
    if (window._matchingDt)
      setTimeout(function () {
        window._matchingDt.columns.adjust();
      }, 60);
  });
}

function changeValuesInMatchingReqModal(
  area,
  availability,
  propertytype_id,
  sqfeet,
  availabilitytype,
  condition,
) {
  // Re-entrancy guard. The matching trigger renders as nested elements that
  // both carry this inline onclick, so a single user click bubbles and calls
  // this twice in the same tick — which would init the modal DataTable twice
  // and fire two identical AJAX requests (see clients/listing/all double-hit).
  // Collapse duplicate calls with the same arguments inside a short window
  // into one, while still allowing a genuine re-open (different property, or
  // the same one after the window elapses).
  var _sig = [area, availability, propertytype_id, sqfeet, availabilitytype, condition].join("|");
  var _now =
    window.performance && performance.now ? performance.now() : Date.now();
  if (
    window.__lastMatchingReqCall &&
    window.__lastMatchingReqCall.sig === _sig &&
    _now - window.__lastMatchingReqCall.t < 400
  ) {
    return;
  }
  window.__lastMatchingReqCall = { sig: _sig, t: _now };

  sqfeet = parseInt(sqfeet);
  var minsqfeet = 0,
    maxsqfeet = 0;
  if (sqfeet > 0) {
    minsqfeet = sqfeet - sqfeet / 5;
    maxsqfeet = sqfeet + sqfeet / 5;
  }
  // NOTE: `condition` is intentionally NOT part of the match query. The
  // property's condition value almost never equals a requirement's condition,
  // so filtering on it collapses the result set to zero. The legacy matching
  // flow (commonlist.js) never sent it either. Keep the arg for signature
  // compatibility but exclude it from searchfield/searchval below.
  var searchAjaxVal =
    propertytype_id +
    "##" +
    availability +
    "##" +
    area +
    "##" +
    minsqfeet +
    "##" +
    maxsqfeet +
    "##" +
    availabilitytype;

  // Tear down any previous DataTable instance bound to this modal so a
  // fresh init doesn't choke on a stale table reference.
  if (window._matchingDt) {
    try {
      window._matchingDt.destroy();
    } catch (e) {}
    window._matchingDt = null;
  }

  // The inline onclick fires before the data-toggle delegate adds `.in`,
  // so the modal is still hidden when DataTables tries to measure column
  // widths. Force-open here so init happens against a visible container.
  $("#matchingReqDiv").addClass("in");

  // Build a fresh table skeleton inside the modal. Column order mirrors
  // clients/_buildListingRowCells() for an All listing without relatedreq —
  // we let the controller render full rows so the column indices are
  // predictable.
  var $body = $("#matchingReqDiv .modal-body").empty();
  var theadHtml =
    '<thead class="header"><tr>' +
    '<th class="actions-tip">Action</th>' +
    "<th>Verified</th>" +
    "<th>Req ID</th>" +
    "<th>Type</th>" +
    "<th>Date</th>" +
    "<th>Broker</th>" +
    "<th>Estate</th>" +
    "<th>Phone</th>" +
    "<th>Area</th>" +
    "<th>Min Budget</th>" +
    "<th>Max Budget</th>" +
    "<th>Availability</th>" +
    "<th>Condition</th>" +
    "<th>Sq.Ft.</th>" +
    "<th>Requirement</th>" +
    "</tr></thead>";
  $body.html(
    '<div class="overflow-x-auto">' +
      '<table id="matchingReqList" class="display table table-condensed listing_table w-full">' +
      theadHtml +
      "<tbody></tbody></table></div>",
  );
  $("#matchingreqcount").text("0");

  window._matchingDt = $("#matchingReqList").DataTable({
    serverSide: true,
    processing: true,
    searching: false,
    ordering: false,
    autoWidth: false,
    scrollX: true,
    scrollY: "calc(100vh - 16rem)",
    scrollCollapse: true,
    lengthMenu: [
      [25, 50, 100, 200],
      [25, 50, 100, 200],
    ],
    pageLength: 50,
    columnDefs: [
      { width: "6%", targets: [getColIdxByHeader("Action")] },
      { width: "6%", targets: [getColIdxByHeader("Verified")] },
      { width: "7%", targets: [getColIdxByHeader("Req ID")] },
      { width: "7%", targets: [getColIdxByHeader("Type")] },
      {
        className: "dt-modal-date-col",
        width: "8rem",
        targets: [getColIdxByHeader("Date")],
      },
      { width: "8%", targets: [getColIdxByHeader("Broker")] },
      { width: "8%", targets: [getColIdxByHeader("Estate")] },
      { width: "7%", targets: [getColIdxByHeader("Phone")] },
      {
        className: "dt-modal-area-col",
        width: "14rem",
        targets: [getColIdxByHeader("Area")],
      },
      { width: "7%", targets: [getColIdxByHeader("Min Budget")] },
      { width: "7%", targets: [getColIdxByHeader("Max Budget")] },
      { width: "6%", targets: [getColIdxByHeader("Availability")] },
      { width: "6%", targets: [getColIdxByHeader("Condition")] },
      { width: "7%", targets: [getColIdxByHeader("Sq.Ft.")] },
      {
        className: "dt-expandable-col",
        targets: [getColIdxByHeader("Requirement")],
      },
    ],
    // Pager at both top and bottom so users don't have to scroll a long
    // results table to advance pages.
    layout: {
      topStart: "pageLength",
      topEnd: "paging",
      bottomStart: "info",
      bottomEnd: "paging",
    },
    ajax: {
      url: window._propCfg.reqListingUrl,
      type: "POST",
      data: function (d) {
        d.searchfield =
          "propertytype_id##availability##area##minarea##maxarea##availabilitytype";
        d.searchval = searchAjaxVal;
      },
    },
  });

  // Helper to get column index by header text for modal table
  function getColIdxByHeader(header) {
    var idx = -1;
    $("#matchingReqList thead th").each(function (i) {
      if ($(this).text().trim() === header) idx = i;
    });
    return idx;
  }

  window._matchingDt.on("xhr.dt", function (e, settings, json) {
    if (json && typeof json.recordsTotal !== "undefined") {
      $("#matchingreqcount").text(json.recordsTotal);
    }
  });
  window._matchingDt.on("draw.dt", function () {
    window.kaizenModalClamp("#matchingReqList", /^(requirement)$/i);
    setTimeout(function () {
      if (window._matchingDt) window._matchingDt.columns.adjust();
    }, 60);
  });
}
