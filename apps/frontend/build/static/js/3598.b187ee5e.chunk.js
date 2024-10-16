"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [3598],
  {
    71221: (e, t, a) => {
      a.d(t, { U: () => D });
      var r = a(26240),
        n = a(68903),
        l = a(15795),
        s = a(51787),
        o = a(42518),
        i = a(25434),
        c = a(31337),
        d = a(65043),
        u = a(73216),
        m = a(93747),
        p = a(60184),
        f = a(27722),
        h = a(88739),
        b = a(30681),
        x = a(43845),
        A = a(70579);
      const g = (e) => {
        let { filters: t, handleDeleteFilter: a } = e;
        const l = (0, r.A)();
        return t && t.length > 0
          ? (0, A.jsx)(n.Ay, {
              item: !0,
              xs: 12,
              className:
                "!flex !flex-row !justify-start  !w-full !flex-wrap !mt-3",
              gap: 1,
              children:
                null === t || void 0 === t
                  ? void 0
                  : t.map((e, t) =>
                      (0, A.jsx)(
                        b.Ay,
                        {
                          className: "!max-w-max !p-0 ",
                          children: (0, A.jsx)(x.A, {
                            label: ""
                              .concat(e.field, " ")
                              .concat(e.operator, " ")
                              .concat(e.value),
                            onDelete: () => {
                              a(t);
                            },
                            deleteIcon: (0, A.jsx)(p.QCr, {
                              className: "!text-sm",
                              style: { color: l.palette.primary.contrastText },
                            }),
                            variant: "outlined",
                            className: "!rounded",
                            style: {
                              background: l.palette.background.paper,
                              borderWidth: 0,
                              color: l.palette.primary.contrastText,
                              borderColor: l.palette.primary.main,
                            },
                          }),
                        },
                        t
                      )
                    ),
            })
          : null;
      };
      var v = a(83462),
        y = a(26600),
        j = a(17392),
        N = a(35316),
        C = a(72221),
        S = a(32143),
        w = a(29347),
        k = a(86178),
        T = a.n(k),
        E = a(17160),
        R = a(6881),
        _ = a(81953);
      const M = (e) => {
          let {
            tableName: t,
            setFilters: a,
            filters: l,
            isFilterMenuOpen: s,
            handleCLoseFilterMenu: i,
            combinator: c,
            setCombinator: u,
            readColumns: m,
          } = e;
          const { pmUser: f } = (0, E.hD)(),
            b = (0, r.A)(),
            [x, g] = (0, d.useState)(""),
            [k, M] = (0, d.useState)(""),
            [I, D] = (0, d.useState)(""),
            O = (0, d.useMemo)(() => {
              if (m) {
                return (0, R.Kt)(m);
              }
              return null;
            }, [m]),
            P = (0, d.useMemo)(() => {
              if (m && x) return m.find((e) => e.name === x).type;
            }, [m, x]);
          return (0, A.jsxs)(v.A, {
            open: s,
            onClose: i,
            "aria-labelledby": "alert-dialog-title",
            "aria-describedby": "alert-dialog-description",
            scroll: "paper",
            maxWidth: "sm",
            fullWidth: !0,
            children: [
              (0, A.jsxs)(y.A, {
                style: {
                  background: b.palette.background.default,
                  color: b.palette.primary.contrastText,
                },
                className:
                  " !text-lg !flex flex-row justify-between items-center w-full",
                children: [
                  "Filters",
                  (0, A.jsx)(j.A, {
                    "aria-label": "close",
                    onClick: i,
                    children: (0, A.jsx)(p.QCr, { className: "!text-sm" }),
                  }),
                ],
              }),
              (0, A.jsx)(N.A, {
                dividers: !0,
                style: {
                  background: b.palette.background.default,
                  color: b.palette.primary.contrastText,
                },
                children: (0, A.jsxs)(n.Ay, {
                  container: !0,
                  spacing: 2,
                  children: [
                    (0, A.jsx)(n.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 4,
                      children: (0, A.jsxs)(C.A, {
                        name: "combinator",
                        onChange: (e) => {
                          u(e.target.value);
                        },
                        value: c,
                        IconComponent: () =>
                          (0, A.jsx)(p.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children: [
                          (0, A.jsx)(
                            S.A,
                            {
                              value: "OR",
                              className: "!break-words !whitespace-pre-line",
                              children: "OR",
                            },
                            "OR"
                          ),
                          (0, A.jsx)(
                            S.A,
                            {
                              value: "AND",
                              className: "!break-words !whitespace-pre-line",
                              children: "AND",
                            },
                            "AND"
                          ),
                        ],
                      }),
                    }),
                    (0, A.jsx)(n.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 4,
                      children: (0, A.jsx)(C.A, {
                        name: "field",
                        onChange: (e) => {
                          g(e.target.value);
                        },
                        value: x,
                        IconComponent: () =>
                          (0, A.jsx)(p.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === O || void 0 === O
                            ? void 0
                            : O.map((e, t) =>
                                (0, A.jsx)(
                                  S.A,
                                  {
                                    value: e.field,
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: e.headerName,
                                  },
                                  t
                                )
                              ),
                      }),
                    }),
                    (0, A.jsx)(n.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 4,
                      children: (0, A.jsx)(C.A, {
                        name: "operator",
                        onChange: (e) => {
                          M(e.target.value);
                        },
                        value: k,
                        IconComponent: () =>
                          (0, A.jsx)(p.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children: Object.keys(h.a.TABLE_FILTERS).map((e, t) =>
                          (0, A.jsx)(
                            S.A,
                            {
                              value: e,
                              className: "!break-words !whitespace-pre-line",
                              children: e,
                            },
                            t
                          )
                        ),
                      }),
                    }),
                    P &&
                      (0, A.jsx)(n.Ay, {
                        item: !0,
                        xs: 12,
                        sm: 12,
                        children: (0, A.jsx)(_.K, {
                          name: "value",
                          type: P,
                          value: I,
                          onChange: (e) => {
                            if (P) {
                              let t = "";
                              switch (P) {
                                case h.a.DATA_TYPES.STRING:
                                case h.a.DATA_TYPES.BOOLEAN:
                                  t = e.target.value;
                                  break;
                                case h.a.DATA_TYPES.DATETIME:
                                  t = T()(e).toDate();
                                  break;
                                case h.a.DATA_TYPES.INT:
                                  t = parseInt(e.target.value);
                                  break;
                                default:
                                  t = e.target.value;
                              }
                              D(t);
                            }
                          },
                          required: !0,
                          showDefault: !0,
                        }),
                      }),
                  ],
                }),
              }),
              (0, A.jsx)(w.A, {
                style: {
                  background: b.palette.background.default,
                  color: b.palette.primary.contrastText,
                },
                children: (0, A.jsx)(o.A, {
                  disableElevation: !0,
                  variant: "contained",
                  size: "small",
                  onClick: (e) => {
                    if ((e.preventDefault(), x && k && I)) {
                      a([...l, { ...{ field: x, operator: k, value: I } }]);
                    }
                  },
                  children: "Apply filter",
                }),
              }),
            ],
          });
        },
        I = (e) => {
          let {
            tableName: t,
            setSortModel: a,
            sortModel: l,
            isSortMenuOpen: s,
            handleCLoseSortMenu: i,
            readColumns: c,
          } = e;
          const { pmUser: u } = (0, E.hD)(),
            m = (0, r.A)(),
            [f, b] = (0, d.useState)(l ? l.field : ""),
            [x, g] = (0, d.useState)(l ? l.order : ""),
            k = (0, d.useMemo)(() => {
              if (c) {
                return (0, R.Kt)(c);
              }
              return null;
            }, [c]);
          return (0, A.jsxs)(v.A, {
            open: s,
            onClose: i,
            "aria-labelledby": "alert-dialog-title",
            "aria-describedby": "alert-dialog-description",
            scroll: "paper",
            maxWidth: "sm",
            fullWidth: !0,
            children: [
              (0, A.jsxs)(y.A, {
                style: {
                  background: m.palette.background.default,
                  color: m.palette.primary.contrastText,
                },
                className:
                  " !text-lg !flex flex-row justify-between items-center w-full",
                children: [
                  "Sort",
                  (0, A.jsx)(j.A, {
                    "aria-label": "close",
                    onClick: i,
                    children: (0, A.jsx)(p.QCr, { className: "!text-sm" }),
                  }),
                ],
              }),
              (0, A.jsx)(N.A, {
                style: {
                  background: m.palette.background.default,
                  color: m.palette.primary.contrastText,
                },
                dividers: !0,
                children: (0, A.jsxs)(n.Ay, {
                  container: !0,
                  spacing: 2,
                  className: "!p-4",
                  children: [
                    (0, A.jsx)(n.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 6,
                      children: (0, A.jsx)(C.A, {
                        name: "field",
                        onChange: (e) => {
                          b(e.target.value);
                        },
                        value: f,
                        IconComponent: () =>
                          (0, A.jsx)(p.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === k || void 0 === k
                            ? void 0
                            : k.map((e, t) =>
                                (0, A.jsx)(
                                  S.A,
                                  {
                                    value: e.field,
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: e.headerName,
                                  },
                                  t
                                )
                              ),
                      }),
                    }),
                    (0, A.jsx)(n.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 6,
                      children: (0, A.jsx)(C.A, {
                        name: "operator",
                        onChange: (e) => {
                          g(e.target.value);
                        },
                        value: x,
                        IconComponent: () =>
                          (0, A.jsx)(p.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children: Object.keys(h.a.TABLE_COLUMN_SORT).map(
                          (e, t) =>
                            (0, A.jsx)(
                              S.A,
                              {
                                value: e,
                                className: "!break-words !whitespace-pre-line",
                                children: e,
                              },
                              t
                            )
                        ),
                      }),
                    }),
                  ],
                }),
              }),
              (0, A.jsx)(w.A, {
                style: {
                  background: m.palette.background.default,
                  color: m.palette.primary.contrastText,
                },
                children: (0, A.jsx)(o.A, {
                  disableElevation: !0,
                  variant: "contained",
                  size: "small",
                  onClick: (e) => {
                    e.preventDefault(),
                      (f && x === h.a.TABLE_COLUMN_SORT.asc) ||
                      x === h.a.TABLE_COLUMN_SORT.desc
                        ? a({ field: f, order: x })
                        : a(null),
                      i();
                  },
                  children: "Apply sort",
                }),
              }),
            ],
          });
        },
        D = (e) => {
          let {
            setFilterQuery: t,
            setSortModel: a,
            sortModel: b,
            reloadData: x,
            tableName: v,
            addRowNavigation: y,
            compact: j,
            allowAdd: N,
          } = e;
          const C = (0, r.A)(),
            [S, w] = (0, d.useState)(""),
            k = (0, c.d7)(S, 300),
            [T, E] = (0, d.useState)(!1),
            [R, _] = (0, d.useState)(!1),
            [D, O] = (0, d.useState)([]),
            [P, L] = (0, d.useState)("AND"),
            z = (0, u.Zp)(),
            {
              isLoading: B,
              data: F,
              error: U,
            } = (0, m.I)({
              queryKey: [
                "REACT_QUERY_KEY_TABLES_".concat(String(v).toUpperCase()),
                "read_column",
              ],
              queryFn: () => (0, f.S6)({ tableName: v }),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            });
          (0, d.useEffect)(() => {
            if (F && v && P && D && D.length > 0) {
              const e = [];
              D.map((t) => {
                let a = {},
                  r = {};
                r[t.operator] = t.value;
                F.find((e) => e.name === t.field).type ==
                  h.a.DATA_TYPES.STRING && (r.mode = "insensitive"),
                  (a[t.field] = r),
                  e.push({ ...a });
              });
              const a = {};
              (a[P] = [...e]), null === t || void 0 === t || t(a);
            } else if (F && v && k && "" !== k) {
              let e = [];
              console.log({ readColumns: F });
              F.forEach((t) => {
                t.type != h.a.DATA_TYPES.STRING ||
                  t.isList ||
                  e.push({ [t.name]: { contains: k, mode: "insensitive" } });
              });
              console.log({ queries: e }),
                null === t || void 0 === t || t({ OR: e });
            } else t(null);
          }, [D, k, P, F, v]);
          const q = () => {
            _(!0);
          };
          return (0, A.jsxs)(n.Ay, {
            container: !0,
            className: "py-2",
            rowSpacing: 1,
            children: [
              (0, A.jsx)(n.Ay, {
                item: !0,
                xs: 12,
                md: 12,
                lg: j ? 12 : 6,
                children: (0, A.jsx)(l.A, {
                  required: !0,
                  fullWidth: !0,
                  size: "small",
                  variant: "outlined",
                  type: "text",
                  name: "query",
                  placeholder: "Search",
                  InputProps: {
                    startAdornment: (0, A.jsx)(s.A, {
                      position: "start",
                      children: (0, A.jsx)(p.KSO, {
                        className: "!text-sm",
                        style: { color: C.palette.primary.main },
                      }),
                    }),
                  },
                  onChange: (e) => {
                    w(e.target.value);
                  },
                  className: "!border-[#7b79ff]",
                  value: S,
                }),
              }),
              (0, A.jsxs)(n.Ay, {
                item: !0,
                xs: 12,
                md: 12,
                lg: j ? 12 : 6,
                className: "!flex !flex-row !justify-end !items-center",
                children: [
                  (0, A.jsx)(o.A, {
                    id: "filter-menu-positioned-button",
                    onClick: () => {
                      E(!0);
                    },
                    startIcon: (0, A.jsx)(p.YsJ, { className: "!text-sm" }),
                    variant: "outlined",
                    size: "medium",
                    children: "Filter",
                  }),
                  b
                    ? (0, A.jsxs)(i.A, {
                        variant: "outlined",
                        "aria-label": "outlined button group",
                        className: "!ml-2",
                        children: [
                          (0, A.jsx)(o.A, {
                            id: "filter-menu-positioned-button",
                            onClick: q,
                            startIcon: (0, A.jsx)(p.MjW, {
                              className: "!text-sm",
                            }),
                            variant: "outlined",
                            size: "medium",
                            children: "".concat(b.field, " | ").concat(b.order),
                          }),
                          (0, A.jsx)(o.A, {
                            id: "filter-menu-positioned-button",
                            onClick: () => a(null),
                            endIcon: (0, A.jsx)(p.QCr, {
                              className: "!text-sm",
                            }),
                            variant: "outlined",
                            size: "medium",
                          }),
                        ],
                      })
                    : (0, A.jsx)(o.A, {
                        id: "filter-menu-positioned-button",
                        onClick: q,
                        startIcon: (0, A.jsx)(p.MjW, { className: "!text-sm" }),
                        variant: "outlined",
                        size: "medium",
                        className: "!ml-2",
                        children: "Sort",
                      }),
                  (0, A.jsx)(o.A, {
                    onClick: x,
                    startIcon: (0, A.jsx)(p.Lsu, { className: "!text-sm" }),
                    size: "medium",
                    variant: "outlined",
                    className: "!ml-2",
                    children: "Reload",
                  }),
                  N &&
                    (0, A.jsx)(o.A, {
                      onClick: () => {
                        z(y || h.a.ROUTES.ADD_ROW.path(v));
                      },
                      startIcon: (0, A.jsx)(p.OiG, { className: "!text-sm" }),
                      size: "medium",
                      variant: "contained",
                      className: "!ml-2",
                      children: "Add",
                    }),
                ],
              }),
              (0, A.jsx)(g, {
                filters: D,
                handleDeleteFilter: (e) => {
                  if (e > -1) {
                    const t = [...D];
                    t.splice(e, 1), O(t);
                  }
                },
              }),
              (0, A.jsx)(M, {
                isFilterMenuOpen: T,
                handleCLoseFilterMenu: () => {
                  E(!1);
                },
                tableName: v,
                setFilters: O,
                filters: D,
                combinator: P,
                setCombinator: L,
                readColumns: F,
              }),
              (0, A.jsx)(I, {
                isSortMenuOpen: R,
                handleCLoseSortMenu: () => {
                  _(!1);
                },
                tableName: v,
                setSortModel: a,
                sortModel: b,
                readColumns: F,
              }),
            ],
          });
        };
    },
    83608: (e, t, a) => {
      a.d(t, { Q: () => f });
      var r = a(73216),
        n = a(63248),
        l = a(93747),
        s = a(27722),
        o = a(17160),
        i = a(26240),
        c = a(68903),
        d = a(88739),
        u = a(5737),
        m = a(22168),
        p = a(70579);
      const f = (e) => {
        let { tableName: t, altTableName: a, filterQuery: f } = e;
        const { pmUser: h } = (0, o.hD)(),
          b = ((0, n.jE)(), (0, r.Zp)(), (0, i.A)()),
          {
            isLoading: x,
            data: A,
            isError: g,
            error: v,
            isFetching: y,
            isPreviousData: j,
          } = (0, l.I)({
            queryKey: [
              "REACT_QUERY_KEY_TABLES_".concat(
                String(t).toUpperCase(),
                "_STATS"
              ),
              f,
            ],
            queryFn: () => (0, s.wP)({ tableName: t, filterQuery: f }),
            enabled: Boolean(h),
            cacheTime: 0,
            retry: 0,
            staleTime: 0,
            keepPreviousData: !0,
          });
        return x
          ? (0, p.jsx)(u.R, {})
          : null !== A && void 0 !== A && A.statistics && h
          ? (0, p.jsxs)(c.Ay, {
              container: !0,
              columnSpacing: 2,
              rowSpacing: 1,
              className: "!mb-4",
              children: [
                (0, p.jsx)(c.Ay, {
                  item: !0,
                  xs: 12,
                  children: (0, p.jsx)("span", {
                    className: "!text-xl !font-bold",
                    style: { color: b.palette.primary.contrastText },
                    children: a || "".concat(t),
                  }),
                }),
                (0, p.jsx)(c.Ay, {
                  item: !0,
                  xs: 12,
                  children: (0, p.jsx)("span", {
                    className: "!text-sm !font-thin !text-slate-400",
                    children: "Total records : ".concat(A.statistics.rowCount),
                  }),
                }),
              ],
            })
          : (0, p.jsx)("div", {
              className: "!w-full !p-4",
              children: (0, p.jsx)(m.A, {
                error: v || d.a.ERROR_CODES.SERVER_ERROR,
              }),
            });
      };
    },
    43598: (e, t, a) => {
      a.r(t), a.d(t, { default: () => Ae });
      var r = a(73216),
        n = a(26240),
        l = a(57528),
        s = a(98587),
        o = a(58168),
        i = a(65043),
        c = a(58387),
        d = a(68606),
        u = a(83290),
        m = a(67266),
        p = a(10875),
        f = a(6803),
        h = a(34535),
        b = a(98206),
        x = a(57056),
        A = a(32400);
      function g(e) {
        return (0, A.Ay)("MuiLinearProgress", e);
      }
      (0, x.A)("MuiLinearProgress", [
        "root",
        "colorPrimary",
        "colorSecondary",
        "determinate",
        "indeterminate",
        "buffer",
        "query",
        "dashed",
        "dashedColorPrimary",
        "dashedColorSecondary",
        "bar",
        "barColorPrimary",
        "barColorSecondary",
        "bar1Indeterminate",
        "bar1Determinate",
        "bar1Buffer",
        "bar2Indeterminate",
        "bar2Buffer",
      ]);
      var v,
        y,
        j,
        N,
        C,
        S,
        w = a(70579);
      const k = ["className", "color", "value", "valueBuffer", "variant"];
      let T, E, R, _, M, I;
      const D = (0, u.i7)(
          T ||
            (T =
              v ||
              (v = (0, l.A)([
                "\n  0% {\n    left: -35%;\n    right: 100%;\n  }\n\n  60% {\n    left: 100%;\n    right: -90%;\n  }\n\n  100% {\n    left: 100%;\n    right: -90%;\n  }\n",
              ])))
        ),
        O = (0, u.i7)(
          E ||
            (E =
              y ||
              (y = (0, l.A)([
                "\n  0% {\n    left: -200%;\n    right: 100%;\n  }\n\n  60% {\n    left: 107%;\n    right: -8%;\n  }\n\n  100% {\n    left: 107%;\n    right: -8%;\n  }\n",
              ])))
        ),
        P = (0, u.i7)(
          R ||
            (R =
              j ||
              (j = (0, l.A)([
                "\n  0% {\n    opacity: 1;\n    background-position: 0 -23px;\n  }\n\n  60% {\n    opacity: 0;\n    background-position: 0 -23px;\n  }\n\n  100% {\n    opacity: 1;\n    background-position: -200px -23px;\n  }\n",
              ])))
        ),
        L = (e, t) =>
          "inherit" === t
            ? "currentColor"
            : e.vars
            ? e.vars.palette.LinearProgress["".concat(t, "Bg")]
            : "light" === e.palette.mode
            ? (0, m.a)(e.palette[t].main, 0.62)
            : (0, m.e$)(e.palette[t].main, 0.5),
        z = (0, h.Ay)("span", {
          name: "MuiLinearProgress",
          slot: "Root",
          overridesResolver: (e, t) => {
            const { ownerState: a } = e;
            return [t.root, t["color".concat((0, f.A)(a.color))], t[a.variant]];
          },
        })((e) => {
          let { ownerState: t, theme: a } = e;
          return (0, o.A)(
            {
              position: "relative",
              overflow: "hidden",
              display: "block",
              height: 4,
              zIndex: 0,
              "@media print": { colorAdjust: "exact" },
              backgroundColor: L(a, t.color),
            },
            "inherit" === t.color &&
              "buffer" !== t.variant && {
                backgroundColor: "none",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "currentColor",
                  opacity: 0.3,
                },
              },
            "buffer" === t.variant && { backgroundColor: "transparent" },
            "query" === t.variant && { transform: "rotate(180deg)" }
          );
        }),
        B = (0, h.Ay)("span", {
          name: "MuiLinearProgress",
          slot: "Dashed",
          overridesResolver: (e, t) => {
            const { ownerState: a } = e;
            return [t.dashed, t["dashedColor".concat((0, f.A)(a.color))]];
          },
        })((e) => {
          let { ownerState: t, theme: a } = e;
          const r = L(a, t.color);
          return (0, o.A)(
            {
              position: "absolute",
              marginTop: 0,
              height: "100%",
              width: "100%",
            },
            "inherit" === t.color && { opacity: 0.3 },
            {
              backgroundImage: "radial-gradient("
                .concat(r, " 0%, ")
                .concat(r, " 16%, transparent 42%)"),
              backgroundSize: "10px 10px",
              backgroundPosition: "0 -23px",
            }
          );
        }, (0, u.AH)(_ || (_ = N || (N = (0, l.A)(["\n    animation: ", " 3s infinite linear;\n  "]))), P)),
        F = (0, h.Ay)("span", {
          name: "MuiLinearProgress",
          slot: "Bar1",
          overridesResolver: (e, t) => {
            const { ownerState: a } = e;
            return [
              t.bar,
              t["barColor".concat((0, f.A)(a.color))],
              ("indeterminate" === a.variant || "query" === a.variant) &&
                t.bar1Indeterminate,
              "determinate" === a.variant && t.bar1Determinate,
              "buffer" === a.variant && t.bar1Buffer,
            ];
          },
        })(
          (e) => {
            let { ownerState: t, theme: a } = e;
            return (0, o.A)(
              {
                width: "100%",
                position: "absolute",
                left: 0,
                bottom: 0,
                top: 0,
                transition: "transform 0.2s linear",
                transformOrigin: "left",
                backgroundColor:
                  "inherit" === t.color
                    ? "currentColor"
                    : (a.vars || a).palette[t.color].main,
              },
              "determinate" === t.variant && {
                transition: "transform .".concat(4, "s linear"),
              },
              "buffer" === t.variant && {
                zIndex: 1,
                transition: "transform .".concat(4, "s linear"),
              }
            );
          },
          (e) => {
            let { ownerState: t } = e;
            return (
              ("indeterminate" === t.variant || "query" === t.variant) &&
              (0, u.AH)(
                M ||
                  (M =
                    C ||
                    (C = (0, l.A)([
                      "\n      width: auto;\n      animation: ",
                      " 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;\n    ",
                    ]))),
                D
              )
            );
          }
        ),
        U = (0, h.Ay)("span", {
          name: "MuiLinearProgress",
          slot: "Bar2",
          overridesResolver: (e, t) => {
            const { ownerState: a } = e;
            return [
              t.bar,
              t["barColor".concat((0, f.A)(a.color))],
              ("indeterminate" === a.variant || "query" === a.variant) &&
                t.bar2Indeterminate,
              "buffer" === a.variant && t.bar2Buffer,
            ];
          },
        })(
          (e) => {
            let { ownerState: t, theme: a } = e;
            return (0, o.A)(
              {
                width: "100%",
                position: "absolute",
                left: 0,
                bottom: 0,
                top: 0,
                transition: "transform 0.2s linear",
                transformOrigin: "left",
              },
              "buffer" !== t.variant && {
                backgroundColor:
                  "inherit" === t.color
                    ? "currentColor"
                    : (a.vars || a).palette[t.color].main,
              },
              "inherit" === t.color && { opacity: 0.3 },
              "buffer" === t.variant && {
                backgroundColor: L(a, t.color),
                transition: "transform .".concat(4, "s linear"),
              }
            );
          },
          (e) => {
            let { ownerState: t } = e;
            return (
              ("indeterminate" === t.variant || "query" === t.variant) &&
              (0, u.AH)(
                I ||
                  (I =
                    S ||
                    (S = (0, l.A)([
                      "\n      width: auto;\n      animation: ",
                      " 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;\n    ",
                    ]))),
                O
              )
            );
          }
        ),
        q = i.forwardRef(function (e, t) {
          const a = (0, b.b)({ props: e, name: "MuiLinearProgress" }),
            {
              className: r,
              color: n = "primary",
              value: l,
              valueBuffer: i,
              variant: u = "indeterminate",
            } = a,
            m = (0, s.A)(a, k),
            h = (0, o.A)({}, a, { color: n, variant: u }),
            x = ((e) => {
              const { classes: t, variant: a, color: r } = e,
                n = {
                  root: ["root", "color".concat((0, f.A)(r)), a],
                  dashed: ["dashed", "dashedColor".concat((0, f.A)(r))],
                  bar1: [
                    "bar",
                    "barColor".concat((0, f.A)(r)),
                    ("indeterminate" === a || "query" === a) &&
                      "bar1Indeterminate",
                    "determinate" === a && "bar1Determinate",
                    "buffer" === a && "bar1Buffer",
                  ],
                  bar2: [
                    "bar",
                    "buffer" !== a && "barColor".concat((0, f.A)(r)),
                    "buffer" === a && "color".concat((0, f.A)(r)),
                    ("indeterminate" === a || "query" === a) &&
                      "bar2Indeterminate",
                    "buffer" === a && "bar2Buffer",
                  ],
                };
              return (0, d.A)(n, g, t);
            })(h),
            A = (0, p.I)(),
            v = {},
            y = { bar1: {}, bar2: {} };
          if ("determinate" === u || "buffer" === u)
            if (void 0 !== l) {
              (v["aria-valuenow"] = Math.round(l)),
                (v["aria-valuemin"] = 0),
                (v["aria-valuemax"] = 100);
              let e = l - 100;
              A && (e = -e), (y.bar1.transform = "translateX(".concat(e, "%)"));
            } else 0;
          if ("buffer" === u)
            if (void 0 !== i) {
              let e = (i || 0) - 100;
              A && (e = -e), (y.bar2.transform = "translateX(".concat(e, "%)"));
            } else 0;
          return (0,
          w.jsxs)(z, (0, o.A)({ className: (0, c.A)(x.root, r), ownerState: h, role: "progressbar" }, v, { ref: t }, m, { children: ["buffer" === u ? (0, w.jsx)(B, { className: x.dashed, ownerState: h }) : null, (0, w.jsx)(F, { className: x.bar1, ownerState: h, style: y.bar1 }), "determinate" === u ? null : (0, w.jsx)(U, { className: x.bar2, ownerState: h, style: y.bar2 })] }));
        });
      var W = a(79190),
        Q = a(72221),
        Y = a(32143),
        K = a(33691),
        V = a(69633),
        G = a(46060),
        J = a(76674),
        H = a(92334);
      const Z = ["className", "children"],
        X = (0, G.A)("div", {
          name: "MuiDataGrid",
          slot: "ToolbarContainer",
          overridesResolver: (e, t) => t.toolbarContainer,
        })((e) => {
          let { theme: t } = e;
          return {
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: t.spacing(1),
            padding: t.spacing(0.5, 0.5, 0),
          };
        }),
        $ = i.forwardRef(function (e, t) {
          const { className: a, children: r } = e,
            n = (0, s.A)(e, Z),
            l = (0, H.A)(),
            i = ((e) => {
              const { classes: t } = e;
              return (0, d.A)({ root: ["toolbarContainer"] }, J.B, t);
            })(l);
          return r
            ? (0, w.jsx)(
                X,
                (0, o.A)(
                  { ref: t, className: (0, c.A)(a, i.root), ownerState: l },
                  n,
                  { children: r }
                )
              )
            : null;
        });
      var ee = a(63248),
        te = a(93747),
        ae = a(27722),
        re = a(17160),
        ne = a(88739),
        le = a(16082),
        se = a(5737),
        oe = a(6881),
        ie = a(71221),
        ce = a(22168),
        de = a(83608),
        ue = a(47097),
        me = a(42518),
        pe = a(45394),
        fe = a(76639),
        he = a(56249);
      const be = (e) => {
          let { tableName: t, ids: a } = e;
          const { pmUser: r } = (0, re.hD)(),
            n = (0, ee.jE)(),
            [l, s] = (0, i.useState)(!1),
            o = (0, i.useMemo)(() => {
              if (r && r && t) {
                return !!r.extractRowDeleteAuthorization(t);
              }
              return !1;
            }, [r, t]),
            {
              isPending: c,
              isSuccess: d,
              isError: u,
              error: m,
              mutate: p,
            } = (0, ue.n)({
              mutationFn: (e) => {
                let { tableName: t, ids: a } = e;
                return (0, ae.lE)({ tableName: t, ids: a });
              },
              retry: !1,
              onSuccess: () => {
                (0, fe.qq)("Deleted rows successfully"),
                  s(!1),
                  n.invalidateQueries([
                    "REACT_QUERY_KEY_TABLES_".concat(String(t).toUpperCase()),
                  ]);
              },
              onError: (e) => {
                (0, fe.jx)(e);
              },
            });
          return (
            o &&
            (0, w.jsxs)(w.Fragment, {
              children: [
                (0, w.jsx)(me.A, {
                  onClick: () => {
                    s(!0);
                  },
                  startIcon: (0, w.jsx)(pe.tW_, { className: "!text-sm" }),
                  size: "medium",
                  variant: "outlined",
                  className: "!ml-2",
                  color: "error",
                  children: "Delete selected rows",
                }),
                (0, w.jsx)(he.K, {
                  open: l,
                  onAccepted: () => {
                    p({ tableName: t, ids: a });
                  },
                  onDecline: () => {
                    s(!1);
                  },
                  title: "Delete rows?",
                  message: "Are you sure you want to delete multiple rows",
                }),
              ],
            })
          );
        },
        xe = (e) => {
          let {
            tableName: t,
            onRowClick: a,
            showStats: l,
            containerClass: s,
          } = e;
          const { dbModel: o, internalAppVariables: c } = (0, le.O0)(),
            { pmUser: d } = (0, re.hD)(),
            u = ((0, ee.jE)(), (0, r.Zp)()),
            [m, p] = (0, i.useState)(1),
            [f, h] = (0, i.useState)(null),
            [b, x] = (0, i.useState)(null),
            A = (0, n.A)(),
            [g, v] = (0, i.useState)(null),
            [y, j] = (0, i.useState)(20),
            {
              isLoading: N,
              data: C,
              isError: S,
              error: k,
              isFetching: T,
              isPreviousData: E,
              refetch: R,
            } = (0, te.I)({
              queryKey: [
                "REACT_QUERY_KEY_TABLES_".concat(String(t).toUpperCase()),
                m,
                y,
                f,
                b,
              ],
              queryFn: () =>
                (0, ae.$z)({
                  tableName: t,
                  page: m,
                  pageSize: y,
                  filterQuery: f,
                  sortModel: b,
                }),
              enabled: Boolean(d),
              cacheTime: 0,
              retry: 0,
              staleTime: 0,
              keepPreviousData: !0,
            }),
            {
              isLoading: _,
              data: M,
              error: I,
            } = (0, te.I)({
              queryKey: [
                "REACT_QUERY_KEY_TABLES_".concat(String(t).toUpperCase()),
                "read_column",
              ],
              queryFn: () => (0, ae.S6)({ tableName: t }),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            }),
            D = (0, i.useMemo)(() => {
              if ((console.log({ iiiinternalAppVariables: c }), M)) {
                var e;
                console.log({
                  internalAppVariables:
                    null === c || void 0 === c
                      ? void 0
                      : c.CUSTOM_INT_VIEW_MAPPING,
                });
                return (0, oe.Kt)(
                  M,
                  null === c ||
                    void 0 === c ||
                    null === (e = c.CUSTOM_INT_VIEW_MAPPING) ||
                    void 0 === e
                    ? void 0
                    : e[t]
                );
              }
              return null;
            }, [M, c]),
            O = (0, i.useMemo)(() => {
              if (o) return (0, oe.J_)(t, o);
            }, [t, o]),
            P = (0, i.useCallback)(
              (e) => {
                let t = O.join("_");
                if (0 == e.length) v(null);
                else {
                  const a = e.map((e) => {
                      const a = JSON.parse(e);
                      return O.length > 1 ? a[t] : a[O[0]];
                    }),
                    r =
                      O.length > 1 ? { [t]: { in: a } } : { [O[0]]: { in: a } };
                  v(r);
                }
              },
              [O, v]
            ),
            L = (0, i.useMemo)(
              () => (0, w.jsx)(be, { tableName: t, ids: g }),
              [t, g]
            );
          return (0, w.jsxs)("div", {
            className: "w-full h-full ".concat(
              s,
              "   !overflow-y-auto !overflow-x-auto"
            ),
            children: [
              (0, w.jsxs)("div", {
                xs: 12,
                item: !0,
                className: "!w-full !p-4 !h-fit",
                style: { background: A.palette.background.default },
                children: [
                  l && (0, w.jsx)(de.Q, { tableName: t, filterQuery: f }),
                  (0, w.jsx)(ie.U, {
                    filterQuery: f,
                    setFilterQuery: h,
                    reloadData: R,
                    tableName: t,
                    setSortModel: x,
                    sortModel: b,
                    allowAdd: !0,
                  }),
                ],
              }),
              (0, w.jsx)("div", {
                item: !0,
                xs: 12,
                className: "!relative",
                children: N
                  ? (0, w.jsx)(se.R, {})
                  : null !== C && void 0 !== C && C.rows && d && D && O
                  ? (0, w.jsxs)("div", {
                      className: "px-4",
                      children: [
                        (0, w.jsx)(V.zh, {
                          rows: C.rows,
                          loading: N || T,
                          className: "!border-0 data-grid-custom-class",
                          columns: D,
                          initialState: {},
                          editMode: "row",
                          hideFooterPagination: !0,
                          hideFooterSelectedRowCount: !0,
                          checkboxSelection: !0,
                          disableRowSelectionOnClick: !0,
                          getRowId: (e) => {
                            let t = {},
                              a = O.join("_");
                            for (let r = 0; r < O.length; r++)
                              t[O[r]] = e[O[r]];
                            return O.length > 1
                              ? JSON.stringify({ [a]: t })
                              : JSON.stringify(t);
                          },
                          hideFooter: !0,
                          onRowClick: (e) => {
                            a
                              ? a(e)
                              : u(
                                  ne.a.ROUTES.ROW_VIEW.path(
                                    t,
                                    JSON.stringify(
                                      ((e) => {
                                        let t = {},
                                          a = O.join("_");
                                        for (let r = 0; r < O.length; r++)
                                          t[O[r]] = e[O[r]];
                                        return O.length > 1 ? { [a]: t } : t;
                                      })(e.row)
                                    )
                                  )
                                );
                          },
                          disableColumnFilter: !0,
                          sortingMode: "server",
                          autoHeight: !0,
                          getRowHeight: () => "auto",
                          slots: {
                            toolbar: () =>
                              (0, w.jsx)($, {
                                className: "!py-2 !-pr-5 justify-end",
                                children: L,
                              }),
                            loadingOverlay: q,
                          },
                          onRowSelectionModelChange: P,
                        }),
                        (0, w.jsxs)("div", {
                          className:
                            "flex flex-row w-full justify-end pb-2 !sticky !bottom-0 items-center pt-2",
                          style: {
                            background: A.palette.background.default,
                            borderTopWidth: 1,
                            borderColor: A.palette.divider,
                          },
                          children: [
                            (0, w.jsx)(W.A, {
                              id: "demo-simple-select-label",
                              className: "!mr-2",
                              children: "Page size",
                            }),
                            (0, w.jsx)(Q.A, {
                              size: "small",
                              labelId: "demo-simple-select-label",
                              value: y,
                              variant: "standard",
                              label: "Page size",
                              onChange: (e) => {
                                j(parseInt(e.target.value));
                              },
                              children: [20, 50, 100].map((e) =>
                                (0, w.jsx)(
                                  Y.A,
                                  {
                                    value: e,
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: "".concat(e, "     "),
                                  },
                                  "page_size_".concat(e)
                                )
                              ),
                            }),
                            (0, w.jsx)(K.A, {
                              count: Boolean(
                                null === C || void 0 === C ? void 0 : C.nextPage
                              )
                                ? m + 1
                                : m,
                              page: m,
                              onChange: (e, t) => {
                                p(t);
                              },
                              hideNextButton: !Boolean(
                                null === C || void 0 === C ? void 0 : C.nextPage
                              ),
                              variant: "text",
                              shape: "rounded",
                              siblingCount: 1,
                            }),
                          ],
                        }),
                      ],
                    })
                  : (0, w.jsx)("div", {
                      className: "!w-full !p-4",
                      children: (0, w.jsx)(ce.A, {
                        error: k || ne.a.ERROR_CODES.SERVER_ERROR,
                      }),
                    }),
              }),
            ],
          });
        },
        Ae = (e) => {
          let {} = e;
          const { table_name: t } = (0, r.g)();
          return (0, w.jsx)("div", {
            className:
              "flex flex-col justify-start items-stretch w-full h-full",
            children: t && (0, w.jsx)(xe, { showStats: !0, tableName: t }),
          });
        };
    },
  },
]);
//# sourceMappingURL=3598.b187ee5e.chunk.js.map
