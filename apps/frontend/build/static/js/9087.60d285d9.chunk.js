"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [9087],
  {
    94085: (e, a, t) => {
      t.d(a, {
        t8: () => i,
        Jr: () => u,
        y1: () => c,
        Iu: () => m,
        kn: () => n,
        Tc: () => d,
      });
      var s,
        r = t(88739);
      class l {
        constructor(e) {
          let {
            pm_user_id: a,
            username: t,
            first_name: s,
            address1: r,
            pm_policy_object_id: l,
            email: o,
            is_disabled: i,
            created_at: n,
            updated_at: d,
            disabled_at: c,
            disable_reason: u,
            tbl_pm_policy_objects: m,
          } = e;
          (this.pm_user_id = a),
            (this.username = t),
            (this.first_name = s),
            (this.address1 = r),
            (this.pm_policy_object_id = l),
            (this.email = o),
            (this.is_disabled = i),
            (this.created_at = n),
            (this.updated_at = d),
            (this.disabled_at = c),
            (this.disable_reason = u),
            (this.is_profile_complete =
              this.first_name && this.email && this.address1),
            (this.tbl_pm_policy_objects = m),
            (this.policy = m ? m.policy : null);
        }
      }
      (s = l),
        (l.toList = (e) => {
          if (Array.isArray(e)) return e.map((e) => new s(e));
        });
      var o = t(33211);
      const i = async (e) => {
          let { data: a } = e;
          try {
            const e = await o.A.post(r.a.APIS.ACCOUNT.addAccount(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        n = async (e) => {
          let { data: a } = e;
          try {
            const e = await o.A.put(r.a.APIS.ACCOUNT.updateAccount(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data && e.data.error
              ? e.data.error
              : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw (console.log({ error: t }), t);
          }
        },
        d = async (e) => {
          let { data: a } = e;
          try {
            const e = await o.A.put(r.a.APIS.ACCOUNT.updatePassword(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data && e.data.error
              ? e.data.error
              : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw (console.log({ error: t }), t);
          }
        },
        c = async (e) => {
          let { pmAccountID: a } = e;
          try {
            const e = await o.A.get(r.a.APIS.ACCOUNT.getAccountByID({ id: a }));
            if (e.data && 1 == e.data.success) return new l(e.data.account);
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        u = async (e) => {
          let { pmAccountID: a } = e;
          try {
            const e = await o.A.delete(
              r.a.APIS.ACCOUNT.deleteAccountByID({ id: a })
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        m = async () => {
          try {
            const e = await o.A.get(r.a.APIS.ACCOUNT.getAllAccounts());
            if (e.data && 1 == e.data.success) {
              const a = l.toList(e.data.accounts);
              return console.log({ accounts: a }), a;
            }
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
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
        UZ: () => m,
        bc: () => i,
        lE: () => R,
        oJ: () => u,
        wP: () => d,
        x9: () => c,
        xH: () => l,
      });
      var s = t(88739),
        r = t(33211);
      const l = async () => {
          try {
            const e = await r.A.get(s.a.APIS.TABLE.getAllTables());
            if (e.data && 1 == e.data.success) return e.data.tables;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (e) {
            throw e;
          }
        },
        o = async (e) => {
          let { tableName: a } = e;
          try {
            const e = await r.A.get(
              s.a.APIS.TABLE.getTableColumns({ tableName: a })
            );
            if (e.data && 1 == e.data.success)
              return Array.from(e.data.columns);
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        i = async (e) => {
          let { tableName: a } = e;
          try {
            const e = await r.A.get(
              s.a.APIS.TABLE.getAuthorizedColumnsForAdd({ tableName: a })
            );
            if (e.data && 1 == e.data.success)
              return Array.from(e.data.columns);
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
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
            const e = await r.A.get(
              s.a.APIS.TABLE.getTableRows({
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
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (n) {
            throw n;
          }
        },
        d = async (e) => {
          let { tableName: a, filterQuery: t } = e;
          try {
            const e = await r.A.get(
              s.a.APIS.TABLE.getTableStats({ tableName: a, filterQuery: t })
            );
            if (e.data && 1 == e.data.success)
              return e.data.statistics
                ? { statistics: e.data.statistics }
                : { statistics: null };
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        },
        c = async (e) => {
          let { tableName: a, id: t } = e;
          try {
            const e = await r.A.get(
              s.a.APIS.TABLE.getTableRowByID({ tableName: a, id: t })
            );
            if (e.data && 1 == e.data.success) return e.data.row;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        },
        u = async (e) => {
          let { tableName: a, id: t, data: l } = e;
          try {
            const e = await r.A.put(
              s.a.APIS.TABLE.updateTableRowByID({ tableName: a, id: t }),
              l
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (o) {
            throw o;
          }
        },
        m = async (e) => {
          let { tableName: a, data: t } = e;
          try {
            const e = await r.A.post(
              s.a.APIS.TABLE.addTableRowByID({ tableName: a }),
              t
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        },
        h = async (e) => {
          let { tableName: a, id: t } = e;
          try {
            const e = await r.A.delete(
              s.a.APIS.TABLE.deleteTableRowByID({ tableName: a, id: t })
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        },
        R = async (e) => {
          let { tableName: a, ids: t } = e;
          try {
            const e = await r.A.post(
              s.a.APIS.TABLE.deleteTableRowByMultipleIDs({ tableName: a }),
              { query: t }
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        };
    },
    71221: (e, a, t) => {
      t.d(a, { U: () => k });
      var s = t(26240),
        r = t(68903),
        l = t(15795),
        o = t(51787),
        i = t(42518),
        n = t(25434),
        d = t(31337),
        c = t(65043),
        u = t(73216),
        m = t(93747),
        h = t(60184),
        R = t(27722),
        p = t(88739),
        A = t(30681),
        x = t(43845),
        E = t(70579);
      const y = (e) => {
        let { filters: a, handleDeleteFilter: t } = e;
        const l = (0, s.A)();
        return a && a.length > 0
          ? (0, E.jsx)(r.Ay, {
              item: !0,
              xs: 12,
              className:
                "!flex !flex-row !justify-start  !w-full !flex-wrap !mt-3",
              gap: 1,
              children:
                null === a || void 0 === a
                  ? void 0
                  : a.map((e, a) =>
                      (0, E.jsx)(
                        A.Ay,
                        {
                          className: "!max-w-max !p-0 ",
                          children: (0, E.jsx)(x.A, {
                            label: ""
                              .concat(e.field, " ")
                              .concat(e.operator, " ")
                              .concat(e.value),
                            onDelete: () => {
                              t(a);
                            },
                            deleteIcon: (0, E.jsx)(h.QCr, {
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
      var f = t(83462),
        b = t(26600),
        w = t(17392),
        _ = t(35316),
        N = t(72221),
        S = t(32143),
        j = t(29347),
        C = t(86178),
        g = t.n(C),
        v = t(17160),
        O = t(6881),
        T = t(81953);
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
          const { pmUser: R } = (0, v.hD)(),
            A = (0, s.A)(),
            [x, y] = (0, c.useState)(""),
            [C, D] = (0, c.useState)(""),
            [I, k] = (0, c.useState)(""),
            M = (0, c.useMemo)(() => {
              if (m) {
                return (0, O.Kt)(m);
              }
              return null;
            }, [m]),
            P = (0, c.useMemo)(() => {
              if (m && x) return m.find((e) => e.name === x).type;
            }, [m, x]);
          return (0, E.jsxs)(f.A, {
            open: o,
            onClose: n,
            "aria-labelledby": "alert-dialog-title",
            "aria-describedby": "alert-dialog-description",
            scroll: "paper",
            maxWidth: "sm",
            fullWidth: !0,
            children: [
              (0, E.jsxs)(b.A, {
                style: {
                  background: A.palette.background.default,
                  color: A.palette.primary.contrastText,
                },
                className:
                  " !text-lg !flex flex-row justify-between items-center w-full",
                children: [
                  "Filters",
                  (0, E.jsx)(w.A, {
                    "aria-label": "close",
                    onClick: n,
                    children: (0, E.jsx)(h.QCr, { className: "!text-sm" }),
                  }),
                ],
              }),
              (0, E.jsx)(_.A, {
                dividers: !0,
                style: {
                  background: A.palette.background.default,
                  color: A.palette.primary.contrastText,
                },
                children: (0, E.jsxs)(r.Ay, {
                  container: !0,
                  spacing: 2,
                  children: [
                    (0, E.jsx)(r.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 4,
                      children: (0, E.jsxs)(N.A, {
                        name: "combinator",
                        onChange: (e) => {
                          u(e.target.value);
                        },
                        value: d,
                        IconComponent: () =>
                          (0, E.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children: [
                          (0, E.jsx)(
                            S.A,
                            {
                              value: "OR",
                              className: "!break-words !whitespace-pre-line",
                              children: "OR",
                            },
                            "OR"
                          ),
                          (0, E.jsx)(
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
                    (0, E.jsx)(r.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 4,
                      children: (0, E.jsx)(N.A, {
                        name: "field",
                        onChange: (e) => {
                          y(e.target.value);
                        },
                        value: x,
                        IconComponent: () =>
                          (0, E.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === M || void 0 === M
                            ? void 0
                            : M.map((e, a) =>
                                (0, E.jsx)(
                                  S.A,
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
                    (0, E.jsx)(r.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 4,
                      children: (0, E.jsx)(N.A, {
                        name: "operator",
                        onChange: (e) => {
                          D(e.target.value);
                        },
                        value: C,
                        IconComponent: () =>
                          (0, E.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children: Object.keys(p.a.TABLE_FILTERS).map((e, a) =>
                          (0, E.jsx)(
                            S.A,
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
                    P &&
                      (0, E.jsx)(r.Ay, {
                        item: !0,
                        xs: 12,
                        sm: 12,
                        children: (0, E.jsx)(T.K, {
                          name: "value",
                          type: P,
                          value: I,
                          onChange: (e) => {
                            if (P) {
                              let a = "";
                              switch (P) {
                                case p.a.DATA_TYPES.STRING:
                                case p.a.DATA_TYPES.BOOLEAN:
                                  a = e.target.value;
                                  break;
                                case p.a.DATA_TYPES.DATETIME:
                                  a = g()(e).toDate();
                                  break;
                                case p.a.DATA_TYPES.INT:
                                  a = parseInt(e.target.value);
                                  break;
                                default:
                                  a = e.target.value;
                              }
                              k(a);
                            }
                          },
                          required: !0,
                          showDefault: !0,
                        }),
                      }),
                  ],
                }),
              }),
              (0, E.jsx)(j.A, {
                style: {
                  background: A.palette.background.default,
                  color: A.palette.primary.contrastText,
                },
                children: (0, E.jsx)(i.A, {
                  disableElevation: !0,
                  variant: "contained",
                  size: "small",
                  onClick: (e) => {
                    if ((e.preventDefault(), x && C && I)) {
                      t([...l, { ...{ field: x, operator: C, value: I } }]);
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
            tableName: a,
            setSortModel: t,
            sortModel: l,
            isSortMenuOpen: o,
            handleCLoseSortMenu: n,
            readColumns: d,
          } = e;
          const { pmUser: u } = (0, v.hD)(),
            m = (0, s.A)(),
            [R, A] = (0, c.useState)(l ? l.field : ""),
            [x, y] = (0, c.useState)(l ? l.order : ""),
            C = (0, c.useMemo)(() => {
              if (d) {
                return (0, O.Kt)(d);
              }
              return null;
            }, [d]);
          return (0, E.jsxs)(f.A, {
            open: o,
            onClose: n,
            "aria-labelledby": "alert-dialog-title",
            "aria-describedby": "alert-dialog-description",
            scroll: "paper",
            maxWidth: "sm",
            fullWidth: !0,
            children: [
              (0, E.jsxs)(b.A, {
                style: {
                  background: m.palette.background.default,
                  color: m.palette.primary.contrastText,
                },
                className:
                  " !text-lg !flex flex-row justify-between items-center w-full",
                children: [
                  "Sort",
                  (0, E.jsx)(w.A, {
                    "aria-label": "close",
                    onClick: n,
                    children: (0, E.jsx)(h.QCr, { className: "!text-sm" }),
                  }),
                ],
              }),
              (0, E.jsx)(_.A, {
                style: {
                  background: m.palette.background.default,
                  color: m.palette.primary.contrastText,
                },
                dividers: !0,
                children: (0, E.jsxs)(r.Ay, {
                  container: !0,
                  spacing: 2,
                  className: "!p-4",
                  children: [
                    (0, E.jsx)(r.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 6,
                      children: (0, E.jsx)(N.A, {
                        name: "field",
                        onChange: (e) => {
                          A(e.target.value);
                        },
                        value: R,
                        IconComponent: () =>
                          (0, E.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === C || void 0 === C
                            ? void 0
                            : C.map((e, a) =>
                                (0, E.jsx)(
                                  S.A,
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
                    (0, E.jsx)(r.Ay, {
                      item: !0,
                      xs: 12,
                      sm: 6,
                      children: (0, E.jsx)(N.A, {
                        name: "operator",
                        onChange: (e) => {
                          y(e.target.value);
                        },
                        value: x,
                        IconComponent: () =>
                          (0, E.jsx)(h.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children: Object.keys(p.a.TABLE_COLUMN_SORT).map(
                          (e, a) =>
                            (0, E.jsx)(
                              S.A,
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
              (0, E.jsx)(j.A, {
                style: {
                  background: m.palette.background.default,
                  color: m.palette.primary.contrastText,
                },
                children: (0, E.jsx)(i.A, {
                  disableElevation: !0,
                  variant: "contained",
                  size: "small",
                  onClick: (e) => {
                    e.preventDefault(),
                      (R && x === p.a.TABLE_COLUMN_SORT.asc) ||
                      x === p.a.TABLE_COLUMN_SORT.desc
                        ? t({ field: R, order: x })
                        : t(null),
                      n();
                  },
                  children: "Apply sort",
                }),
              }),
            ],
          });
        },
        k = (e) => {
          let {
            setFilterQuery: a,
            setSortModel: t,
            sortModel: A,
            reloadData: x,
            tableName: f,
            addRowNavigation: b,
            compact: w,
            allowAdd: _,
          } = e;
          const N = (0, s.A)(),
            [S, j] = (0, c.useState)(""),
            C = (0, d.d7)(S, 300),
            [g, v] = (0, c.useState)(!1),
            [O, T] = (0, c.useState)(!1),
            [k, M] = (0, c.useState)([]),
            [P, L] = (0, c.useState)("AND"),
            B = (0, u.Zp)(),
            {
              isLoading: U,
              data: z,
              error: F,
            } = (0, m.I)({
              queryKey: [
                "REACT_QUERY_KEY_TABLES_".concat(String(f).toUpperCase()),
                "read_column",
              ],
              queryFn: () => (0, R.S6)({ tableName: f }),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            });
          (0, c.useEffect)(() => {
            if (z && f && P && k && k.length > 0) {
              const e = [];
              k.map((a) => {
                let t = {},
                  s = {};
                s[a.operator] = a.value;
                z.find((e) => e.name === a.field).type ==
                  p.a.DATA_TYPES.STRING && (s.mode = "insensitive"),
                  (t[a.field] = s),
                  e.push({ ...t });
              });
              const t = {};
              (t[P] = [...e]), null === a || void 0 === a || a(t);
            } else if (z && f && C && "" !== C) {
              let e = [];
              console.log({ readColumns: z });
              z.forEach((a) => {
                a.type != p.a.DATA_TYPES.STRING ||
                  a.isList ||
                  e.push({ [a.name]: { contains: C, mode: "insensitive" } });
              });
              console.log({ queries: e }),
                null === a || void 0 === a || a({ OR: e });
            } else a(null);
          }, [k, C, P, z, f]);
          const V = () => {
            T(!0);
          };
          return (0, E.jsxs)(r.Ay, {
            container: !0,
            className: "py-2",
            rowSpacing: 1,
            children: [
              (0, E.jsx)(r.Ay, {
                item: !0,
                xs: 12,
                md: 12,
                lg: w ? 12 : 6,
                children: (0, E.jsx)(l.A, {
                  required: !0,
                  fullWidth: !0,
                  size: "small",
                  variant: "outlined",
                  type: "text",
                  name: "query",
                  placeholder: "Search",
                  InputProps: {
                    startAdornment: (0, E.jsx)(o.A, {
                      position: "start",
                      children: (0, E.jsx)(h.KSO, {
                        className: "!text-sm",
                        style: { color: N.palette.primary.main },
                      }),
                    }),
                  },
                  onChange: (e) => {
                    j(e.target.value);
                  },
                  className: "!border-[#7b79ff]",
                  value: S,
                }),
              }),
              (0, E.jsxs)(r.Ay, {
                item: !0,
                xs: 12,
                md: 12,
                lg: w ? 12 : 6,
                className: "!flex !flex-row !justify-end !items-center",
                children: [
                  (0, E.jsx)(i.A, {
                    id: "filter-menu-positioned-button",
                    onClick: () => {
                      v(!0);
                    },
                    startIcon: (0, E.jsx)(h.YsJ, { className: "!text-sm" }),
                    variant: "outlined",
                    size: "medium",
                    children: "Filter",
                  }),
                  A
                    ? (0, E.jsxs)(n.A, {
                        variant: "outlined",
                        "aria-label": "outlined button group",
                        className: "!ml-2",
                        children: [
                          (0, E.jsx)(i.A, {
                            id: "filter-menu-positioned-button",
                            onClick: V,
                            startIcon: (0, E.jsx)(h.MjW, {
                              className: "!text-sm",
                            }),
                            variant: "outlined",
                            size: "medium",
                            children: "".concat(A.field, " | ").concat(A.order),
                          }),
                          (0, E.jsx)(i.A, {
                            id: "filter-menu-positioned-button",
                            onClick: () => t(null),
                            endIcon: (0, E.jsx)(h.QCr, {
                              className: "!text-sm",
                            }),
                            variant: "outlined",
                            size: "medium",
                          }),
                        ],
                      })
                    : (0, E.jsx)(i.A, {
                        id: "filter-menu-positioned-button",
                        onClick: V,
                        startIcon: (0, E.jsx)(h.MjW, { className: "!text-sm" }),
                        variant: "outlined",
                        size: "medium",
                        className: "!ml-2",
                        children: "Sort",
                      }),
                  (0, E.jsx)(i.A, {
                    onClick: x,
                    startIcon: (0, E.jsx)(h.Lsu, { className: "!text-sm" }),
                    size: "medium",
                    variant: "outlined",
                    className: "!ml-2",
                    children: "Reload",
                  }),
                  _ &&
                    (0, E.jsx)(i.A, {
                      onClick: () => {
                        B(b || p.a.ROUTES.ADD_ROW.path(f));
                      },
                      startIcon: (0, E.jsx)(h.OiG, { className: "!text-sm" }),
                      size: "medium",
                      variant: "contained",
                      className: "!ml-2",
                      children: "Add",
                    }),
                ],
              }),
              (0, E.jsx)(y, {
                filters: k,
                handleDeleteFilter: (e) => {
                  if (e > -1) {
                    const a = [...k];
                    a.splice(e, 1), M(a);
                  }
                },
              }),
              (0, E.jsx)(D, {
                isFilterMenuOpen: g,
                handleCLoseFilterMenu: () => {
                  v(!1);
                },
                tableName: f,
                setFilters: M,
                filters: k,
                combinator: P,
                setCombinator: L,
                readColumns: z,
              }),
              (0, E.jsx)(I, {
                isSortMenuOpen: O,
                handleCLoseSortMenu: () => {
                  T(!1);
                },
                tableName: f,
                setSortModel: t,
                sortModel: A,
                readColumns: z,
              }),
            ],
          });
        };
    },
    83608: (e, a, t) => {
      t.d(a, { Q: () => R });
      var s = t(73216),
        r = t(63248),
        l = t(93747),
        o = t(27722),
        i = t(17160),
        n = t(26240),
        d = t(68903),
        c = t(88739),
        u = t(5737),
        m = t(22168),
        h = t(70579);
      const R = (e) => {
        let { tableName: a, altTableName: t, filterQuery: R } = e;
        const { pmUser: p } = (0, i.hD)(),
          A = ((0, r.jE)(), (0, s.Zp)(), (0, n.A)()),
          {
            isLoading: x,
            data: E,
            isError: y,
            error: f,
            isFetching: b,
            isPreviousData: w,
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
        return x
          ? (0, h.jsx)(u.R, {})
          : null !== E && void 0 !== E && E.statistics && p
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
                    children: "Total records : ".concat(E.statistics.rowCount),
                  }),
                }),
              ],
            })
          : (0, h.jsx)("div", {
              className: "!w-full !p-4",
              children: (0, h.jsx)(m.A, {
                error: f || c.a.ERROR_CODES.SERVER_ERROR,
              }),
            });
      };
    },
    79087: (e, a, t) => {
      t.r(a), t.d(a, { default: () => b });
      var s = t(73216),
        r = t(43845),
        l = t(68903),
        o = t(42518),
        i = t(33691),
        n = t(69633),
        d = t(93747),
        c = t(65043),
        u = (t(27722), t(17160)),
        m = t(88739),
        h = t(5737),
        R = t(86178),
        p = t.n(R),
        A = (t(68685), t(49804)),
        x = (t(71221), t(22168)),
        E = (t(83608), t(94085)),
        y = t(60184),
        f = t(70579);
      const b = () => {
        const { pmUser: e } = (0, u.hD)(),
          a = (0, s.Zp)(),
          [t, R] = (0, c.useState)(1),
          [b, w] = (0, c.useState)(null),
          [_, N] = (0, c.useState)(null),
          S = (0, c.useMemo)(
            () => e && e.extractAccountAddAuthorization(),
            [e]
          ),
          {
            isLoading: j,
            data: C,
            isError: g,
            error: v,
            isFetching: O,
            isPreviousData: T,
            refetch: D,
          } = (0, d.I)({
            queryKey: ["REACT_QUERY_KEY_ACCOUNTS"],
            queryFn: () => (0, E.Iu)(),
            enabled: Boolean(e),
            cacheTime: 0,
            retry: 0,
            staleTime: 0,
            keepPreviousData: !0,
          }),
          I = [
            { field: "pm_user_id", headerName: "User ID" },
            { field: "username", headerName: "Username", width: 200 },
            { field: "first_name", headerName: "First name", width: 200 },
            { field: "last_name", headerName: "Last name", width: 200 },
            {
              field: "tbl_pm_policy_objects",
              headerName: "Role ID",
              width: 200,
              valueGetter: (e, a) => {
                var t;
                return (
                  console.log({ value: e, row: a }),
                  null === e ||
                  void 0 === e ||
                  null === (t = e.row) ||
                  void 0 === t
                    ? void 0
                    : t.pm_policy_object_id
                );
              },
              renderCell: (e) =>
                (0, f.jsx)(r.A, {
                  label: "".concat(e.value),
                  size: "small",
                  variant: "outlined",
                  color: "info",
                }),
            },
            {
              field: "created_at",
              headerName: "Created at",
              width: 300,
              valueGetter: (e, a) =>
                p()(e).format("dddd, MMMM Do YYYY, h:mm:ss a"),
              renderCell: (e) =>
                (0, f.jsx)(r.A, {
                  label: "".concat(e.value),
                  size: "small",
                  variant: "outlined",
                  color: "secondary",
                  icon: (0, f.jsx)(A.u$_, { className: "!text-sm" }),
                  sx: { borderRadius: 1 },
                }),
            },
            {
              field: "updated_at",
              headerName: "Updated at",
              width: 300,
              valueGetter: (e, a) =>
                p()(e).format("dddd, MMMM Do YYYY, h:mm:ss a"),
              renderCell: (e) =>
                (0, f.jsx)(r.A, {
                  label: "".concat(e.value),
                  size: "small",
                  variant: "outlined",
                  color: "secondary",
                  icon: (0, f.jsx)(A.u$_, { className: "!text-sm" }),
                  sx: { borderRadius: 1 },
                }),
            },
          ];
        return (0, f.jsx)("div", {
          children: j
            ? (0, f.jsx)(h.R, {})
            : C && e
            ? (0, f.jsxs)("div", {
                className: "px-4",
                children: [
                  (0, f.jsxs)(l.Ay, {
                    item: !0,
                    xs: 12,
                    md: 12,
                    lg: 12,
                    className:
                      "!flex !flex-row !justify-end !items-center !w-full !py-3",
                    children: [
                      (0, f.jsx)(o.A, {
                        onClick: D,
                        startIcon: (0, f.jsx)(y.Lsu, { className: "!text-sm" }),
                        size: "medium",
                        variant: "outlined",
                        className: "!ml-2",
                        children: "Reload",
                      }),
                      S &&
                        (0, f.jsx)(o.A, {
                          onClick: () => {
                            a(m.a.ROUTES.ADD_ACCOUNT.path());
                          },
                          startIcon: (0, f.jsx)(y.OiG, {
                            className: "!text-sm",
                          }),
                          size: "medium",
                          variant: "contained",
                          className: "!ml-2",
                          children: "Add",
                        }),
                    ],
                  }),
                  (0, f.jsx)(n.zh, {
                    rows: C,
                    loading: j || O,
                    columns: I,
                    initialState: {},
                    editMode: "row",
                    hideFooterPagination: !0,
                    hideFooterSelectedRowCount: !0,
                    checkboxSelection: !0,
                    disableRowSelectionOnClick: !0,
                    getRowId: (e) => e.pm_user_id,
                    hideFooter: !0,
                    onRowClick: (e) => {
                      a(m.a.ROUTES.ACCOUNT_SETTINGS.path(e.row.pm_user_id));
                    },
                    disableColumnFilter: !0,
                    sortingMode: "server",
                    autoHeight: !0,
                    rowHeight: 200,
                    getRowHeight: () => "auto",
                  }),
                  (0, f.jsx)("div", {
                    className: "flex flex-row w-full justify-end pb-2",
                    children: (0, f.jsx)(i.A, {
                      count: Boolean(
                        null === C || void 0 === C ? void 0 : C.nextPage
                      )
                        ? t + 1
                        : t,
                      page: t,
                      onChange: (e, a) => {
                        R(a);
                      },
                      hideNextButton: !Boolean(
                        null === C || void 0 === C ? void 0 : C.nextPage
                      ),
                      variant: "text",
                      shape: "rounded",
                      className: "!mt-2",
                      siblingCount: 1,
                    }),
                  }),
                ],
              })
            : (0, f.jsx)("div", {
                className: "!w-full !p-4",
                children: (0, f.jsx)(x.A, {
                  error: v || m.a.ERROR_CODES.SERVER_ERROR,
                }),
              }),
        });
      };
    },
    68685: () => {},
  },
]);
//# sourceMappingURL=9087.60d285d9.chunk.js.map
