"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [7325],
  {
    90827: (e, a, t) => {
      t.d(a, {
        eN: () => i,
        ak: () => d,
        Cw: () => m,
        Jl: () => c,
        gu: () => n,
      });
      var r,
        s = t(88739),
        l = t(33211);
      class o {
        constructor(e) {
          let {
            pm_policy_object_id: a,
            title: t,
            policy: r,
            created_at: s,
            is_disabled: l,
          } = e;
          console.log("before"),
            (this.pmPolicyObjectID = parseInt(a)),
            (this.pmPolicyObjectTitle = String(t)),
            (this.pmPolicyObject = JSON.parse(r)),
            (this.createdAt = new Date(s)),
            (this.isDisabled = new Boolean(l)),
            console.log("after");
        }
      }
      (r = o),
        (o.toList = (e) => {
          if (Array.isArray(e)) return e.map((e) => new r(e));
        });
      const i = async (e) => {
          let { data: a } = e;
          try {
            const e = await l.A.post(s.a.APIS.POLICIES.addPolicy(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        n = async (e) => {
          let { data: a } = e;
          try {
            const e = await l.A.put(s.a.APIS.POLICIES.updatePolicy(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data && e.data.error
              ? e.data.error
              : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw (console.log({ error: t }), t);
          }
        },
        c = async (e) => {
          let { pmPolicyObjectID: a } = e;
          try {
            const e = await l.A.get(s.a.APIS.POLICIES.getPolicyByID({ id: a }));
            if (e.data && 1 == e.data.success) return new o(e.data.policy);
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        d = async (e) => {
          let { pmPolicyObjectID: a } = e;
          try {
            const e = await l.A.delete(
              s.a.APIS.POLICIES.deletePolicyByID({ id: a })
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        m = async () => {
          try {
            const e = await l.A.get(s.a.APIS.POLICIES.getAllPolicies());
            if (e.data && 1 == e.data.success) {
              const a = o.toList(e.data.policies);
              return console.log({ policies: a }), a;
            }
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (e) {
            throw (console.log({ error: e }), e);
          }
        };
    },
    27722: (e, a, t) => {
      t.d(a, {
        $z: () => n,
        Ae: () => h,
        S6: () => o,
        UZ: () => u,
        bc: () => i,
        lE: () => R,
        oJ: () => m,
        wP: () => c,
        x9: () => d,
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
              r.a.APIS.TABLE.getAuthorizedColumnsForRead({ tableName: a })
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
        c = async (e) => {
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
        d = async (e) => {
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
        m = async (e) => {
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
        u = async (e) => {
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
        R = async (e) => {
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
      t.d(a, { U: () => P });
      var r = t(26240),
        s = t(68903),
        l = t(15795),
        o = t(51787),
        i = t(42518),
        n = t(25434),
        c = t(31337),
        d = t(65043),
        m = t(73216),
        u = t(93747),
        h = t(60184),
        R = t(27722),
        p = t(88739),
        x = t(30681),
        A = t(43845),
        y = t(70579);
      const E = (e) => {
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
                        x.Ay,
                        {
                          className: "!max-w-max !p-0 ",
                          children: (0, y.jsx)(A.A, {
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
        f = t(26600),
        S = t(17392),
        w = t(35316),
        j = t(72221),
        N = t(32143),
        g = t(29347),
        O = t(86178),
        C = t.n(O),
        v = t(17160),
        T = t(6881),
        I = t(81953);
      const _ = (e) => {
          let {
            tableName: a,
            setFilters: t,
            filters: l,
            isFilterMenuOpen: o,
            handleCLoseFilterMenu: n,
            combinator: c,
            setCombinator: m,
            readColumns: u,
          } = e;
          const { pmUser: R } = (0, v.hD)(),
            x = (0, r.A)(),
            [A, E] = (0, d.useState)(""),
            [O, _] = (0, d.useState)(""),
            [D, P] = (0, d.useState)(""),
            k = (0, d.useMemo)(() => {
              if (u) {
                return (0, T.Kt)(u);
              }
              return null;
            }, [u]),
            L = (0, d.useMemo)(() => {
              if (u && A) return u.find((e) => e.name === A).type;
            }, [u, A]);
          return (0, y.jsxs)(b.A, {
            open: o,
            onClose: n,
            "aria-labelledby": "alert-dialog-title",
            "aria-describedby": "alert-dialog-description",
            scroll: "paper",
            maxWidth: "sm",
            fullWidth: !0,
            children: [
              (0, y.jsxs)(f.A, {
                style: {
                  background: x.palette.background.default,
                  color: x.palette.primary.contrastText,
                },
                className:
                  " !text-lg !flex flex-row justify-between items-center w-full",
                children: [
                  "Filters",
                  (0, y.jsx)(S.A, {
                    "aria-label": "close",
                    onClick: n,
                    children: (0, y.jsx)(h.QCr, { className: "!text-sm" }),
                  }),
                ],
              }),
              (0, y.jsx)(w.A, {
                dividers: !0,
                style: {
                  background: x.palette.background.default,
                  color: x.palette.primary.contrastText,
                },
                children: (0, y.jsxs)(s.Ay, {
                  container: !0,
                  spacing: 2,
                  children: [
                    (0, y.jsx)(s.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 4,
                      children: (0, y.jsxs)(j.A, {
                        name: "combinator",
                        onChange: (e) => {
                          m(e.target.value);
                        },
                        value: c,
                        IconComponent: () =>
                          (0, y.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children: [
                          (0, y.jsx)(
                            N.A,
                            {
                              value: "OR",
                              className: "!break-words !whitespace-pre-line",
                              children: "OR",
                            },
                            "OR"
                          ),
                          (0, y.jsx)(
                            N.A,
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
                      children: (0, y.jsx)(j.A, {
                        name: "field",
                        onChange: (e) => {
                          E(e.target.value);
                        },
                        value: A,
                        IconComponent: () =>
                          (0, y.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === k || void 0 === k
                            ? void 0
                            : k.map((e, a) =>
                                (0, y.jsx)(
                                  N.A,
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
                      children: (0, y.jsx)(j.A, {
                        name: "operator",
                        onChange: (e) => {
                          _(e.target.value);
                        },
                        value: O,
                        IconComponent: () =>
                          (0, y.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children: Object.keys(p.a.TABLE_FILTERS).map((e, a) =>
                          (0, y.jsx)(
                            N.A,
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
                        children: (0, y.jsx)(I.K, {
                          name: "value",
                          type: L,
                          value: D,
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
                              P(a);
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
                  background: x.palette.background.default,
                  color: x.palette.primary.contrastText,
                },
                children: (0, y.jsx)(i.A, {
                  disableElevation: !0,
                  variant: "contained",
                  size: "small",
                  onClick: (e) => {
                    if ((e.preventDefault(), A && O && D)) {
                      t([...l, { ...{ field: A, operator: O, value: D } }]);
                    }
                  },
                  children: "Apply filter",
                }),
              }),
            ],
          });
        },
        D = (e) => {
          let {
            tableName: a,
            setSortModel: t,
            sortModel: l,
            isSortMenuOpen: o,
            handleCLoseSortMenu: n,
            readColumns: c,
          } = e;
          const { pmUser: m } = (0, v.hD)(),
            u = (0, r.A)(),
            [R, x] = (0, d.useState)(l ? l.field : ""),
            [A, E] = (0, d.useState)(l ? l.order : ""),
            O = (0, d.useMemo)(() => {
              if (c) {
                return (0, T.Kt)(c);
              }
              return null;
            }, [c]);
          return (0, y.jsxs)(b.A, {
            open: o,
            onClose: n,
            "aria-labelledby": "alert-dialog-title",
            "aria-describedby": "alert-dialog-description",
            scroll: "paper",
            maxWidth: "sm",
            fullWidth: !0,
            children: [
              (0, y.jsxs)(f.A, {
                style: {
                  background: u.palette.background.default,
                  color: u.palette.primary.contrastText,
                },
                className:
                  " !text-lg !flex flex-row justify-between items-center w-full",
                children: [
                  "Sort",
                  (0, y.jsx)(S.A, {
                    "aria-label": "close",
                    onClick: n,
                    children: (0, y.jsx)(h.QCr, { className: "!text-sm" }),
                  }),
                ],
              }),
              (0, y.jsx)(w.A, {
                style: {
                  background: u.palette.background.default,
                  color: u.palette.primary.contrastText,
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
                      children: (0, y.jsx)(j.A, {
                        name: "field",
                        onChange: (e) => {
                          x(e.target.value);
                        },
                        value: R,
                        IconComponent: () =>
                          (0, y.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === O || void 0 === O
                            ? void 0
                            : O.map((e, a) =>
                                (0, y.jsx)(
                                  N.A,
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
                      children: (0, y.jsx)(j.A, {
                        name: "operator",
                        onChange: (e) => {
                          E(e.target.value);
                        },
                        value: A,
                        IconComponent: () =>
                          (0, y.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children: Object.keys(p.a.TABLE_COLUMN_SORT).map(
                          (e, a) =>
                            (0, y.jsx)(
                              N.A,
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
                  background: u.palette.background.default,
                  color: u.palette.primary.contrastText,
                },
                children: (0, y.jsx)(i.A, {
                  disableElevation: !0,
                  variant: "contained",
                  size: "small",
                  onClick: (e) => {
                    e.preventDefault(),
                      (R && A === p.a.TABLE_COLUMN_SORT.asc) ||
                      A === p.a.TABLE_COLUMN_SORT.desc
                        ? t({ field: R, order: A })
                        : t(null),
                      n();
                  },
                  children: "Apply sort",
                }),
              }),
            ],
          });
        },
        P = (e) => {
          let {
            setFilterQuery: a,
            setSortModel: t,
            sortModel: x,
            reloadData: A,
            tableName: b,
            addRowNavigation: f,
            compact: S,
            allowAdd: w,
          } = e;
          const j = (0, r.A)(),
            [N, g] = (0, d.useState)(""),
            O = (0, c.d7)(N, 300),
            [C, v] = (0, d.useState)(!1),
            [T, I] = (0, d.useState)(!1),
            [P, k] = (0, d.useState)([]),
            [L, M] = (0, d.useState)("AND"),
            B = (0, m.Zp)(),
            {
              isLoading: z,
              data: F,
              error: V,
            } = (0, u.I)({
              queryKey: [
                "REACT_QUERY_KEY_TABLES_".concat(String(b).toUpperCase()),
                "read_column",
              ],
              queryFn: () => (0, R.S6)({ tableName: b }),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            });
          (0, d.useEffect)(() => {
            if (F && b && L && P && P.length > 0) {
              const e = [];
              P.map((a) => {
                let t = {},
                  r = {};
                r[a.operator] = a.value;
                F.find((e) => e.name === a.field).type ==
                  p.a.DATA_TYPES.STRING && (r.mode = "insensitive"),
                  (t[a.field] = r),
                  e.push({ ...t });
              });
              const t = {};
              (t[L] = [...e]), null === a || void 0 === a || a(t);
            } else if (F && b && O && "" !== O) {
              let e = [];
              console.log({ readColumns: F });
              F.forEach((a) => {
                a.type != p.a.DATA_TYPES.STRING ||
                  a.isList ||
                  e.push({ [a.name]: { contains: O, mode: "insensitive" } });
              });
              console.log({ queries: e }),
                null === a || void 0 === a || a({ OR: e });
            } else a(null);
          }, [P, O, L, F, b]);
          const Y = () => {
            I(!0);
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
                lg: S ? 12 : 6,
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
                        style: { color: j.palette.primary.main },
                      }),
                    }),
                  },
                  onChange: (e) => {
                    g(e.target.value);
                  },
                  className: "!border-[#7b79ff]",
                  value: N,
                }),
              }),
              (0, y.jsxs)(s.Ay, {
                item: !0,
                xs: 12,
                md: 12,
                lg: S ? 12 : 6,
                className: "!flex !flex-row !justify-end !items-center",
                children: [
                  (0, y.jsx)(i.A, {
                    id: "filter-menu-positioned-button",
                    onClick: () => {
                      v(!0);
                    },
                    startIcon: (0, y.jsx)(h.YsJ, { className: "!text-sm" }),
                    variant: "outlined",
                    size: "medium",
                    children: "Filter",
                  }),
                  x
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
                            children: "".concat(x.field, " | ").concat(x.order),
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
                    onClick: A,
                    startIcon: (0, y.jsx)(h.Lsu, { className: "!text-sm" }),
                    size: "medium",
                    variant: "outlined",
                    className: "!ml-2",
                    children: "Reload",
                  }),
                  w &&
                    (0, y.jsx)(i.A, {
                      onClick: () => {
                        B(f || p.a.ROUTES.ADD_ROW.path(b));
                      },
                      startIcon: (0, y.jsx)(h.OiG, { className: "!text-sm" }),
                      size: "medium",
                      variant: "contained",
                      className: "!ml-2",
                      children: "Add",
                    }),
                ],
              }),
              (0, y.jsx)(E, {
                filters: P,
                handleDeleteFilter: (e) => {
                  if (e > -1) {
                    const a = [...P];
                    a.splice(e, 1), k(a);
                  }
                },
              }),
              (0, y.jsx)(_, {
                isFilterMenuOpen: C,
                handleCLoseFilterMenu: () => {
                  v(!1);
                },
                tableName: b,
                setFilters: k,
                filters: P,
                combinator: L,
                setCombinator: M,
                readColumns: F,
              }),
              (0, y.jsx)(D, {
                isSortMenuOpen: T,
                handleCLoseSortMenu: () => {
                  I(!1);
                },
                tableName: b,
                setSortModel: t,
                sortModel: x,
                readColumns: F,
              }),
            ],
          });
        };
    },
    83608: (e, a, t) => {
      t.d(a, { Q: () => R });
      var r = t(73216),
        s = t(63248),
        l = t(93747),
        o = t(27722),
        i = t(17160),
        n = t(26240),
        c = t(68903),
        d = t(88739),
        m = t(5737),
        u = t(22168),
        h = t(70579);
      const R = (e) => {
        let { tableName: a, altTableName: t, filterQuery: R } = e;
        const { pmUser: p } = (0, i.hD)(),
          x = ((0, s.jE)(), (0, r.Zp)(), (0, n.A)()),
          {
            isLoading: A,
            data: y,
            isError: E,
            error: b,
            isFetching: f,
            isPreviousData: S,
          } = (0, l.I)({
            queryKey: [
              "REACT_QUERY_KEY_TABLES_".concat(
                String(a).toUpperCase(),
                "_STATS"
              ),
              R,
            ],
            queryFn: () => (0, o.wP)({ tableName: a, filterQuery: R }),
            enabled: Boolean(p),
            cacheTime: 0,
            retry: 0,
            staleTime: 0,
            keepPreviousData: !0,
          });
        return A
          ? (0, h.jsx)(m.R, {})
          : null !== y && void 0 !== y && y.statistics && p
          ? (0, h.jsxs)(c.Ay, {
              container: !0,
              columnSpacing: 2,
              rowSpacing: 1,
              className: "!mb-4",
              children: [
                (0, h.jsx)(c.Ay, {
                  item: !0,
                  xs: 12,
                  children: (0, h.jsx)("span", {
                    className: "!text-xl !font-bold",
                    style: { color: x.palette.primary.contrastText },
                    children: t || "".concat(a),
                  }),
                }),
                (0, h.jsx)(c.Ay, {
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
              children: (0, h.jsx)(u.A, {
                error: b || d.a.ERROR_CODES.SERVER_ERROR,
              }),
            });
      };
    },
    37325: (e, a, t) => {
      t.r(a), t.d(a, { default: () => f });
      var r = t(73216),
        s = t(17160),
        l = t(43845),
        o = t(68903),
        i = t(42518),
        n = t(33691),
        c = t(69633),
        d = t(93747),
        m = t(65043),
        u = (t(27722), t(88739)),
        h = t(5737),
        R = t(86178),
        p = t.n(R),
        x = (t(68685), t(49804)),
        A = (t(71221), t(22168)),
        y = (t(83608), t(90827)),
        E = t(60184),
        b = t(70579);
      const f = () => {
        const { pmUser: e } = (0, s.hD)(),
          a = (0, r.Zp)(),
          [t, R] = (0, m.useState)(1),
          [f, S] = (0, m.useState)(null),
          [w, j] = (0, m.useState)(null),
          {
            isLoading: N,
            data: g,
            isError: O,
            error: C,
            isFetching: v,
            isPreviousData: T,
            refetch: I,
          } = (0, d.I)({
            queryKey: ["REACT_QUERY_KEY_POLICIES"],
            queryFn: () => (0, y.Cw)(),
            enabled: Boolean(e),
            cacheTime: 0,
            retry: 0,
            staleTime: 0,
            keepPreviousData: !0,
          }),
          _ = (0, m.useMemo)(() => e && e.extractPolicyAddAuthorization(), [e]),
          D = [
            { field: "pmPolicyObjectID", headerName: "Policy ID" },
            { field: "pmPolicyObjectTitle", headerName: "Title", width: 200 },
            {
              field: "createdAt",
              headerName: "Created at",
              width: 300,
              valueGetter: (e, a) =>
                p()(e).format("dddd, MMMM Do YYYY, h:mm:ss a"),
              renderCell: (e) =>
                (0, b.jsx)(l.A, {
                  label: "".concat(e.value),
                  size: "small",
                  variant: "outlined",
                  color: "secondary",
                  icon: (0, b.jsx)(x.u$_, { className: "!text-sm" }),
                  sx: { borderRadius: 1 },
                }),
            },
          ];
        return (0, b.jsx)("div", {
          children: N
            ? (0, b.jsx)(h.R, {})
            : g && e
            ? (0, b.jsxs)("div", {
                className: "px-4",
                children: [
                  (0, b.jsxs)(o.Ay, {
                    item: !0,
                    xs: 12,
                    md: 12,
                    lg: 12,
                    className:
                      "!flex !flex-row !justify-end !items-center !w-full !py-3",
                    children: [
                      (0, b.jsx)(i.A, {
                        onClick: I,
                        startIcon: (0, b.jsx)(E.Lsu, { className: "!text-sm" }),
                        size: "medium",
                        variant: "outlined",
                        className: "!ml-2",
                        children: "Reload",
                      }),
                      _ &&
                        (0, b.jsx)(i.A, {
                          onClick: () => {
                            a(u.a.ROUTES.ADD_POLICY.path());
                          },
                          startIcon: (0, b.jsx)(E.OiG, {
                            className: "!text-sm",
                          }),
                          size: "medium",
                          variant: "contained",
                          className: "!ml-2",
                          children: "Add",
                        }),
                    ],
                  }),
                  (0, b.jsx)(c.zh, {
                    rows: g,
                    loading: N || v,
                    columns: D,
                    initialState: {},
                    editMode: "row",
                    hideFooterPagination: !0,
                    hideFooterSelectedRowCount: !0,
                    checkboxSelection: !0,
                    disableRowSelectionOnClick: !0,
                    getRowId: (e) => e.pmPolicyObjectID,
                    hideFooter: !0,
                    onRowClick: (e) => {
                      a(
                        u.a.ROUTES.POLICY_SETTINGS.path(e.row.pmPolicyObjectID)
                      );
                    },
                    disableColumnFilter: !0,
                    sortingMode: "server",
                    autoHeight: !0,
                    rowHeight: 200,
                    getRowHeight: () => "auto",
                  }),
                  (0, b.jsx)("div", {
                    className: "flex flex-row w-full justify-end pb-2",
                    children: (0, b.jsx)(n.A, {
                      count: Boolean(
                        null === g || void 0 === g ? void 0 : g.nextPage
                      )
                        ? t + 1
                        : t,
                      page: t,
                      onChange: (e, a) => {
                        R(a);
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
            : (0, b.jsx)("div", {
                className: "!w-full !p-4",
                children: (0, b.jsx)(A.A, {
                  error: C || u.a.ERROR_CODES.SERVER_ERROR,
                }),
              }),
        });
      };
    },
    68685: () => {},
  },
]);
//# sourceMappingURL=7325.a726d350.chunk.js.map
