"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [3803],
  {
    27722: (e, a, t) => {
      t.d(a, {
        $z: () => n,
        Ae: () => h,
        S6: () => o,
        UZ: () => m,
        bc: () => i,
        lE: () => x,
        oJ: () => u,
        wP: () => d,
        x9: () => c,
        xH: () => l,
      });
      var r = t(88739),
        s = t(33211);
      const l = async () => {
          try {
            const e = await s.A.get(r.a.APIS.TABLE.getAllTables());
            if (e.data && 1 == e.data.success) return e.data.tables;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (e) {
            throw e;
          }
        },
        o = async (e) => {
          let { tableName: a } = e;
          try {
            const e = await s.A.get(
              r.a.APIS.TABLE.getTableColumns({ tableName: a })
            );
            if (e.data && 1 == e.data.success)
              return Array.from(e.data.columns);
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        i = async (e) => {
          let { tableName: a } = e;
          try {
            const e = await s.A.get(
              r.a.APIS.TABLE.getAuthorizedColumnsForAdd({ tableName: a })
            );
            if (e.data && 1 == e.data.success)
              return Array.from(e.data.columns);
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        n = async (e) => {
          let {
            tableName: a,
            page: t = 1,
            pageSize: l = 20,
            filterQuery: o,
            sortModel: i,
          } = e;
          try {
            const e = await s.A.get(
              r.a.APIS.TABLE.getTableRows({
                tableName: a,
                page: t,
                pageSize: l,
                filterQuery: o,
                sortModel: i,
              })
            );
            if (e.data && 1 == e.data.success)
              return e.data.rows && Array.isArray(e.data.rows)
                ? { rows: e.data.rows, nextPage: e.data.nextPage }
                : { rows: [], nextPage: null };
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (n) {
            throw n;
          }
        },
        d = async (e) => {
          let { tableName: a, filterQuery: t } = e;
          try {
            const e = await s.A.get(
              r.a.APIS.TABLE.getTableStats({ tableName: a, filterQuery: t })
            );
            if (e.data && 1 == e.data.success)
              return e.data.statistics
                ? { statistics: e.data.statistics }
                : { statistics: null };
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        },
        c = async (e) => {
          let { tableName: a, id: t } = e;
          try {
            const e = await s.A.get(
              r.a.APIS.TABLE.getTableRowByID({ tableName: a, id: t })
            );
            if (e.data && 1 == e.data.success) return e.data.row;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        },
        u = async (e) => {
          let { tableName: a, id: t, data: l } = e;
          try {
            const e = await s.A.put(
              r.a.APIS.TABLE.updateTableRowByID({ tableName: a, id: t }),
              l
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (o) {
            throw o;
          }
        },
        m = async (e) => {
          let { tableName: a, data: t } = e;
          try {
            const e = await s.A.post(
              r.a.APIS.TABLE.addTableRowByID({ tableName: a }),
              t
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        },
        h = async (e) => {
          let { tableName: a, id: t } = e;
          try {
            const e = await s.A.delete(
              r.a.APIS.TABLE.deleteTableRowByID({ tableName: a, id: t })
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        },
        x = async (e) => {
          let { tableName: a, ids: t } = e;
          try {
            const e = await s.A.post(
              r.a.APIS.TABLE.deleteTableRowByMultipleIDs({ tableName: a }),
              { query: t }
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        };
    },
    71221: (e, a, t) => {
      t.d(a, { U: () => I });
      var r = t(26240),
        s = t(68903),
        l = t(15795),
        o = t(51787),
        i = t(42518),
        n = t(25434),
        d = t(31337),
        c = t(65043),
        u = t(73216),
        m = t(93747),
        h = t(60184),
        x = t(27722),
        p = t(88739),
        A = t(30681),
        R = t(43845),
        y = t(70579);
      const f = (e) => {
        let { filters: a, handleDeleteFilter: t } = e;
        const l = (0, r.A)();
        return a && a.length > 0
          ? (0, y.jsx)(s.Ay, {
              item: !0,
              xs: 12,
              className:
                "!flex !flex-row !justify-start  !w-full !flex-wrap !mt-3",
              gap: 1,
              children:
                null === a || void 0 === a
                  ? void 0
                  : a.map((e, a) =>
                      (0, y.jsx)(
                        A.Ay,
                        {
                          className: "!max-w-max !p-0 ",
                          children: (0, y.jsx)(R.A, {
                            label: ""
                              .concat(e.field, " ")
                              .concat(e.operator, " ")
                              .concat(e.value),
                            onDelete: () => {
                              t(a);
                            },
                            deleteIcon: (0, y.jsx)(h.QCr, {
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
                        a
                      )
                    ),
            })
          : null;
      };
      var b = t(83462),
        E = t(26600),
        j = t(17392),
        N = t(35316),
        S = t(72221),
        w = t(32143),
        g = t(29347),
        v = t(86178),
        C = t.n(v),
        T = t(17160),
        _ = t(6881),
        O = t(81953);
      const D = (e) => {
          let {
            tableName: a,
            setFilters: t,
            filters: l,
            isFilterMenuOpen: o,
            handleCLoseFilterMenu: n,
            combinator: d,
            setCombinator: u,
            readColumns: m,
          } = e;
          const { pmUser: x } = (0, T.hD)(),
            A = (0, r.A)(),
            [R, f] = (0, c.useState)(""),
            [v, D] = (0, c.useState)(""),
            [k, I] = (0, c.useState)(""),
            M = (0, c.useMemo)(() => {
              if (m) {
                return (0, _.Kt)(m);
              }
              return null;
            }, [m]),
            L = (0, c.useMemo)(() => {
              if (m && R) return m.find((e) => e.name === R).type;
            }, [m, R]);
          return (0, y.jsxs)(b.A, {
            open: o,
            onClose: n,
            "aria-labelledby": "alert-dialog-title",
            "aria-describedby": "alert-dialog-description",
            scroll: "paper",
            maxWidth: "sm",
            fullWidth: !0,
            children: [
              (0, y.jsxs)(E.A, {
                style: {
                  background: A.palette.background.default,
                  color: A.palette.primary.contrastText,
                },
                className:
                  " !text-lg !flex flex-row justify-between items-center w-full",
                children: [
                  "Filters",
                  (0, y.jsx)(j.A, {
                    "aria-label": "close",
                    onClick: n,
                    children: (0, y.jsx)(h.QCr, { className: "!text-sm" }),
                  }),
                ],
              }),
              (0, y.jsx)(N.A, {
                dividers: !0,
                style: {
                  background: A.palette.background.default,
                  color: A.palette.primary.contrastText,
                },
                children: (0, y.jsxs)(s.Ay, {
                  container: !0,
                  spacing: 2,
                  children: [
                    (0, y.jsx)(s.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 4,
                      children: (0, y.jsxs)(S.A, {
                        name: "combinator",
                        onChange: (e) => {
                          u(e.target.value);
                        },
                        value: d,
                        IconComponent: () =>
                          (0, y.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children: [
                          (0, y.jsx)(
                            w.A,
                            {
                              value: "OR",
                              className: "!break-words !whitespace-pre-line",
                              children: "OR",
                            },
                            "OR"
                          ),
                          (0, y.jsx)(
                            w.A,
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
                    (0, y.jsx)(s.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 4,
                      children: (0, y.jsx)(S.A, {
                        name: "field",
                        onChange: (e) => {
                          f(e.target.value);
                        },
                        value: R,
                        IconComponent: () =>
                          (0, y.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === M || void 0 === M
                            ? void 0
                            : M.map((e, a) =>
                                (0, y.jsx)(
                                  w.A,
                                  {
                                    value: e.field,
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: e.headerName,
                                  },
                                  a
                                )
                              ),
                      }),
                    }),
                    (0, y.jsx)(s.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 4,
                      children: (0, y.jsx)(S.A, {
                        name: "operator",
                        onChange: (e) => {
                          D(e.target.value);
                        },
                        value: v,
                        IconComponent: () =>
                          (0, y.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children: Object.keys(p.a.TABLE_FILTERS).map((e, a) =>
                          (0, y.jsx)(
                            w.A,
                            {
                              value: e,
                              className: "!break-words !whitespace-pre-line",
                              children: e,
                            },
                            a
                          )
                        ),
                      }),
                    }),
                    L &&
                      (0, y.jsx)(s.Ay, {
                        item: !0,
                        xs: 12,
                        sm: 12,
                        children: (0, y.jsx)(O.K, {
                          name: "value",
                          type: L,
                          value: k,
                          onChange: (e) => {
                            if (L) {
                              let a = "";
                              switch (L) {
                                case p.a.DATA_TYPES.STRING:
                                case p.a.DATA_TYPES.BOOLEAN:
                                  a = e.target.value;
                                  break;
                                case p.a.DATA_TYPES.DATETIME:
                                  a = C()(e).toDate();
                                  break;
                                case p.a.DATA_TYPES.INT:
                                  a = parseInt(e.target.value);
                                  break;
                                default:
                                  a = e.target.value;
                              }
                              I(a);
                            }
                          },
                          required: !0,
                          showDefault: !0,
                        }),
                      }),
                  ],
                }),
              }),
              (0, y.jsx)(g.A, {
                style: {
                  background: A.palette.background.default,
                  color: A.palette.primary.contrastText,
                },
                children: (0, y.jsx)(i.A, {
                  disableElevation: !0,
                  variant: "contained",
                  size: "small",
                  onClick: (e) => {
                    if ((e.preventDefault(), R && v && k)) {
                      t([...l, { ...{ field: R, operator: v, value: k } }]);
                    }
                  },
                  children: "Apply filter",
                }),
              }),
            ],
          });
        },
        k = (e) => {
          let {
            tableName: a,
            setSortModel: t,
            sortModel: l,
            isSortMenuOpen: o,
            handleCLoseSortMenu: n,
            readColumns: d,
          } = e;
          const { pmUser: u } = (0, T.hD)(),
            m = (0, r.A)(),
            [x, A] = (0, c.useState)(l ? l.field : ""),
            [R, f] = (0, c.useState)(l ? l.order : ""),
            v = (0, c.useMemo)(() => {
              if (d) {
                return (0, _.Kt)(d);
              }
              return null;
            }, [d]);
          return (0, y.jsxs)(b.A, {
            open: o,
            onClose: n,
            "aria-labelledby": "alert-dialog-title",
            "aria-describedby": "alert-dialog-description",
            scroll: "paper",
            maxWidth: "sm",
            fullWidth: !0,
            children: [
              (0, y.jsxs)(E.A, {
                style: {
                  background: m.palette.background.default,
                  color: m.palette.primary.contrastText,
                },
                className:
                  " !text-lg !flex flex-row justify-between items-center w-full",
                children: [
                  "Sort",
                  (0, y.jsx)(j.A, {
                    "aria-label": "close",
                    onClick: n,
                    children: (0, y.jsx)(h.QCr, { className: "!text-sm" }),
                  }),
                ],
              }),
              (0, y.jsx)(N.A, {
                style: {
                  background: m.palette.background.default,
                  color: m.palette.primary.contrastText,
                },
                dividers: !0,
                children: (0, y.jsxs)(s.Ay, {
                  container: !0,
                  spacing: 2,
                  className: "!p-4",
                  children: [
                    (0, y.jsx)(s.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 6,
                      children: (0, y.jsx)(S.A, {
                        name: "field",
                        onChange: (e) => {
                          A(e.target.value);
                        },
                        value: x,
                        IconComponent: () =>
                          (0, y.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === v || void 0 === v
                            ? void 0
                            : v.map((e, a) =>
                                (0, y.jsx)(
                                  w.A,
                                  {
                                    value: e.field,
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: e.headerName,
                                  },
                                  a
                                )
                              ),
                      }),
                    }),
                    (0, y.jsx)(s.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 6,
                      children: (0, y.jsx)(S.A, {
                        name: "operator",
                        onChange: (e) => {
                          f(e.target.value);
                        },
                        value: R,
                        IconComponent: () =>
                          (0, y.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children: Object.keys(p.a.TABLE_COLUMN_SORT).map(
                          (e, a) =>
                            (0, y.jsx)(
                              w.A,
                              {
                                value: e,
                                className: "!break-words !whitespace-pre-line",
                                children: e,
                              },
                              a
                            )
                        ),
                      }),
                    }),
                  ],
                }),
              }),
              (0, y.jsx)(g.A, {
                style: {
                  background: m.palette.background.default,
                  color: m.palette.primary.contrastText,
                },
                children: (0, y.jsx)(i.A, {
                  disableElevation: !0,
                  variant: "contained",
                  size: "small",
                  onClick: (e) => {
                    e.preventDefault(),
                      (x && R === p.a.TABLE_COLUMN_SORT.asc) ||
                      R === p.a.TABLE_COLUMN_SORT.desc
                        ? t({ field: x, order: R })
                        : t(null),
                      n();
                  },
                  children: "Apply sort",
                }),
              }),
            ],
          });
        },
        I = (e) => {
          let {
            setFilterQuery: a,
            setSortModel: t,
            sortModel: A,
            reloadData: R,
            tableName: b,
            addRowNavigation: E,
            compact: j,
            allowAdd: N,
          } = e;
          const S = (0, r.A)(),
            [w, g] = (0, c.useState)(""),
            v = (0, d.d7)(w, 300),
            [C, T] = (0, c.useState)(!1),
            [_, O] = (0, c.useState)(!1),
            [I, M] = (0, c.useState)([]),
            [L, B] = (0, c.useState)("AND"),
            P = (0, u.Zp)(),
            {
              isLoading: F,
              data: z,
              error: Q,
            } = (0, m.I)({
              queryKey: [
                "REACT_QUERY_KEY_TABLES_".concat(String(b).toUpperCase()),
                "read_column",
              ],
              queryFn: () => (0, x.S6)({ tableName: b }),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            });
          (0, c.useEffect)(() => {
            if (z && b && L && I && I.length > 0) {
              const e = [];
              I.map((a) => {
                let t = {},
                  r = {};
                r[a.operator] = a.value;
                z.find((e) => e.name === a.field).type ==
                  p.a.DATA_TYPES.STRING && (r.mode = "insensitive"),
                  (t[a.field] = r),
                  e.push({ ...t });
              });
              const t = {};
              (t[L] = [...e]), null === a || void 0 === a || a(t);
            } else if (z && b && v && "" !== v) {
              let e = [];
              console.log({ readColumns: z });
              z.forEach((a) => {
                a.type != p.a.DATA_TYPES.STRING ||
                  a.isList ||
                  e.push({ [a.name]: { contains: v, mode: "insensitive" } });
              });
              console.log({ queries: e }),
                null === a || void 0 === a || a({ OR: e });
            } else a(null);
          }, [I, v, L, z, b]);
          const Y = () => {
            O(!0);
          };
          return (0, y.jsxs)(s.Ay, {
            container: !0,
            className: "py-2",
            rowSpacing: 1,
            children: [
              (0, y.jsx)(s.Ay, {
                item: !0,
                xs: 12,
                md: 12,
                lg: j ? 12 : 6,
                children: (0, y.jsx)(l.A, {
                  required: !0,
                  fullWidth: !0,
                  size: "small",
                  variant: "outlined",
                  type: "text",
                  name: "query",
                  placeholder: "Search",
                  InputProps: {
                    startAdornment: (0, y.jsx)(o.A, {
                      position: "start",
                      children: (0, y.jsx)(h.KSO, {
                        className: "!text-sm",
                        style: { color: S.palette.primary.main },
                      }),
                    }),
                  },
                  onChange: (e) => {
                    g(e.target.value);
                  },
                  className: "!border-[#7b79ff]",
                  value: w,
                }),
              }),
              (0, y.jsxs)(s.Ay, {
                item: !0,
                xs: 12,
                md: 12,
                lg: j ? 12 : 6,
                className: "!flex !flex-row !justify-end !items-center",
                children: [
                  (0, y.jsx)(i.A, {
                    id: "filter-menu-positioned-button",
                    onClick: () => {
                      T(!0);
                    },
                    startIcon: (0, y.jsx)(h.YsJ, { className: "!text-sm" }),
                    variant: "outlined",
                    size: "medium",
                    children: "Filter",
                  }),
                  A
                    ? (0, y.jsxs)(n.A, {
                        variant: "outlined",
                        "aria-label": "outlined button group",
                        className: "!ml-2",
                        children: [
                          (0, y.jsx)(i.A, {
                            id: "filter-menu-positioned-button",
                            onClick: Y,
                            startIcon: (0, y.jsx)(h.MjW, {
                              className: "!text-sm",
                            }),
                            variant: "outlined",
                            size: "medium",
                            children: "".concat(A.field, " | ").concat(A.order),
                          }),
                          (0, y.jsx)(i.A, {
                            id: "filter-menu-positioned-button",
                            onClick: () => t(null),
                            endIcon: (0, y.jsx)(h.QCr, {
                              className: "!text-sm",
                            }),
                            variant: "outlined",
                            size: "medium",
                          }),
                        ],
                      })
                    : (0, y.jsx)(i.A, {
                        id: "filter-menu-positioned-button",
                        onClick: Y,
                        startIcon: (0, y.jsx)(h.MjW, { className: "!text-sm" }),
                        variant: "outlined",
                        size: "medium",
                        className: "!ml-2",
                        children: "Sort",
                      }),
                  (0, y.jsx)(i.A, {
                    onClick: R,
                    startIcon: (0, y.jsx)(h.Lsu, { className: "!text-sm" }),
                    size: "medium",
                    variant: "outlined",
                    className: "!ml-2",
                    children: "Reload",
                  }),
                  N &&
                    (0, y.jsx)(i.A, {
                      onClick: () => {
                        P(E || p.a.ROUTES.ADD_ROW.path(b));
                      },
                      startIcon: (0, y.jsx)(h.OiG, { className: "!text-sm" }),
                      size: "medium",
                      variant: "contained",
                      className: "!ml-2",
                      children: "Add",
                    }),
                ],
              }),
              (0, y.jsx)(f, {
                filters: I,
                handleDeleteFilter: (e) => {
                  if (e > -1) {
                    const a = [...I];
                    a.splice(e, 1), M(a);
                  }
                },
              }),
              (0, y.jsx)(D, {
                isFilterMenuOpen: C,
                handleCLoseFilterMenu: () => {
                  T(!1);
                },
                tableName: b,
                setFilters: M,
                filters: I,
                combinator: L,
                setCombinator: B,
                readColumns: z,
              }),
              (0, y.jsx)(k, {
                isSortMenuOpen: _,
                handleCLoseSortMenu: () => {
                  O(!1);
                },
                tableName: b,
                setSortModel: t,
                sortModel: A,
                readColumns: z,
              }),
            ],
          });
        };
    },
    83608: (e, a, t) => {
      t.d(a, { Q: () => x });
      var r = t(73216),
        s = t(63248),
        l = t(93747),
        o = t(27722),
        i = t(17160),
        n = t(26240),
        d = t(68903),
        c = t(88739),
        u = t(5737),
        m = t(22168),
        h = t(70579);
      const x = (e) => {
        let { tableName: a, altTableName: t, filterQuery: x } = e;
        const { pmUser: p } = (0, i.hD)(),
          A = ((0, s.jE)(), (0, r.Zp)(), (0, n.A)()),
          {
            isLoading: R,
            data: y,
            isError: f,
            error: b,
            isFetching: E,
            isPreviousData: j,
          } = (0, l.I)({
            queryKey: [
              "REACT_QUERY_KEY_TABLES_".concat(
                String(a).toUpperCase(),
                "_STATS"
              ),
              x,
            ],
            queryFn: () => (0, o.wP)({ tableName: a, filterQuery: x }),
            enabled: Boolean(p),
            cacheTime: 0,
            retry: 0,
            staleTime: 0,
            keepPreviousData: !0,
          });
        return R
          ? (0, h.jsx)(u.R, {})
          : null !== y && void 0 !== y && y.statistics && p
          ? (0, h.jsxs)(d.Ay, {
              container: !0,
              columnSpacing: 2,
              rowSpacing: 1,
              className: "!mb-4",
              children: [
                (0, h.jsx)(d.Ay, {
                  item: !0,
                  xs: 12,
                  children: (0, h.jsx)("span", {
                    className: "!text-xl !font-bold",
                    style: { color: A.palette.primary.contrastText },
                    children: t || "".concat(a),
                  }),
                }),
                (0, h.jsx)(d.Ay, {
                  item: !0,
                  xs: 12,
                  children: (0, h.jsx)("span", {
                    className: "!text-sm !font-thin !text-slate-400",
                    children: "Total records : ".concat(y.statistics.rowCount),
                  }),
                }),
              ],
            })
          : (0, h.jsx)("div", {
              className: "!w-full !p-4",
              children: (0, h.jsx)(m.A, {
                error: b || c.a.ERROR_CODES.SERVER_ERROR,
              }),
            });
      };
    },
    33803: (e, a, t) => {
      t.r(a), t.d(a, { default: () => S });
      var r = t(73216),
        s = t(43845),
        l = t(33691),
        o = t(69633),
        i = t(93747),
        n = t(65043),
        d = t(27722),
        c = t(17160),
        u = t(88739),
        m = t(5737);
      const { parse: h, stringify: x } = JSON,
        { keys: p } = Object;
      var A = t(86178),
        R = t.n(A),
        y = (t(68685), t(49804)),
        f = t(71221),
        b = t(22168),
        E = t(83608),
        j = t(13733),
        N = t(70579);
      const S = () => {
        const e = u.a.STRINGS.JOB_HISTORY_TABLE_NAME,
          { pmUser: a } = (0, c.hD)(),
          [t, h] = ((0, r.Zp)(), (0, n.useState)(1)),
          [x, p] = (0, n.useState)(null),
          [A, S] = (0, n.useState)(null),
          {
            isLoading: w,
            data: g,
            isError: v,
            error: C,
            isFetching: T,
            isPreviousData: _,
            refetch: O,
          } = (0, i.I)({
            queryKey: [
              "REACT_QUERY_KEY_TABLES_".concat(String(e).toUpperCase()),
              t,
              x,
              A,
            ],
            queryFn: () =>
              (0, d.$z)({
                tableName: e,
                page: t,
                filterQuery: x,
                sortModel: A,
              }),
            enabled: Boolean(a),
            cacheTime: 0,
            retry: 0,
            staleTime: 0,
            keepPreviousData: !0,
          }),
          D = [
            { field: "pm_job_history_id", headerName: "ID" },
            { field: "pm_job_id", headerName: "Job ID", width: 200 },
            {
              field: "created_at",
              headerName: "Created at",
              width: 300,
              valueGetter: (e, a) =>
                R()(e.value).format("dddd, MMMM Do YYYY, h:mm:ss a"),
              renderCell: (e) =>
                (0, N.jsx)(s.A, {
                  label: "".concat(e.value),
                  size: "small",
                  variant: "outlined",
                  color: "secondary",
                  icon: (0, N.jsx)(y.u$_, { className: "!text-sm" }),
                  sx: { borderRadius: 1 },
                }),
            },
            {
              field: "history_result",
              headerName: "Result/Error",
              minWidth: 300,
              valueGetter: (e, a) =>
                JSON.stringify(e.row.history_result, null, 2),
              renderCell: (e) =>
                (0, N.jsx)(j.B, {
                  outlined: !1,
                  readOnly: !0,
                  code: "".concat(e.value),
                  language: "json",
                  height: "100px",
                }),
            },
          ];
        return (0, N.jsxs)("div", {
          className:
            "flex flex-col justify-start items-stretch w-full h-full !overflow-y-auto !overflow-x-auto",
          children: [
            (0, N.jsxs)("div", {
              className: "!w-full !p-4",
              children: [
                (0, N.jsx)(E.Q, {
                  tableName: e,
                  altTableName: "Jobs history",
                  filterQuery: x,
                }),
                (0, N.jsx)(f.U, {
                  filterQuery: x,
                  setFilterQuery: p,
                  reloadData: O,
                  tableName: e,
                  setSortModel: S,
                  sortModel: A,
                  allowAdd: !1,
                }),
              ],
            }),
            w
              ? (0, N.jsx)(m.R, {})
              : null !== g && void 0 !== g && g.rows && a
              ? (0, N.jsxs)("div", {
                  className: "px-4",
                  children: [
                    (0, N.jsx)(o.zh, {
                      rows: g.rows,
                      loading: w || T,
                      columns: D,
                      initialState: {},
                      editMode: "row",
                      hideFooterPagination: !0,
                      hideFooterSelectedRowCount: !0,
                      checkboxSelection: !0,
                      disableRowSelectionOnClick: !0,
                      getRowId: (e) => e.pm_job_history_id,
                      hideFooter: !0,
                      disableColumnFilter: !0,
                      sortingMode: "server",
                      autoHeight: !0,
                      rowHeight: 200,
                      getRowHeight: () => "auto",
                    }),
                    (0, N.jsx)("div", {
                      className: "flex flex-row w-full justify-end pb-2",
                      children: (0, N.jsx)(l.A, {
                        count: Boolean(
                          null === g || void 0 === g ? void 0 : g.nextPage
                        )
                          ? t + 1
                          : t,
                        page: t,
                        onChange: (e, a) => {
                          h(a);
                        },
                        hideNextButton: !Boolean(
                          null === g || void 0 === g ? void 0 : g.nextPage
                        ),
                        variant: "text",
                        shape: "rounded",
                        className: "!mt-2",
                        siblingCount: 1,
                      }),
                    }),
                  ],
                })
              : (0, N.jsx)("div", {
                  className: "!w-full !p-4",
                  children: (0, N.jsx)(b.A, {
                    error: C || u.a.ERROR_CODES.SERVER_ERROR,
                  }),
                }),
          ],
        });
      };
    },
    68685: () => {},
  },
]);
//# sourceMappingURL=3803.09a447cc.chunk.js.map
