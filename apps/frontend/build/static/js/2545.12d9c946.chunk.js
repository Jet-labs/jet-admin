"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [2545],
  {
    90827: (e, t, a) => {
      a.d(t, {
        eN: () => o,
        ak: () => c,
        Cw: () => h,
        Jl: () => n,
        gu: () => i,
      });
      var s,
        l = a(88739),
        r = a(33211);
      class d {
        constructor(e) {
          let {
            pm_policy_object_id: t,
            title: a,
            policy: s,
            created_at: l,
            is_disabled: r,
          } = e;
          console.log("before"),
            (this.pmPolicyObjectID = parseInt(t)),
            (this.pmPolicyObjectTitle = String(a)),
            (this.pmPolicyObject = JSON.parse(s)),
            (this.createdAt = new Date(l)),
            (this.isDisabled = new Boolean(r)),
            console.log("after");
        }
      }
      (s = d),
        (d.toList = (e) => {
          if (Array.isArray(e)) return e.map((e) => new s(e));
        });
      const o = async (e) => {
          let { data: t } = e;
          try {
            const e = await r.A.post(l.a.APIS.POLICIES.addPolicy(), t);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : l.a.ERROR_CODES.SERVER_ERROR;
          } catch (a) {
            throw a;
          }
        },
        i = async (e) => {
          let { data: t } = e;
          try {
            const e = await r.A.put(l.a.APIS.POLICIES.updatePolicy(), t);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data && e.data.error
              ? e.data.error
              : l.a.ERROR_CODES.SERVER_ERROR;
          } catch (a) {
            throw (console.log({ error: a }), a);
          }
        },
        n = async (e) => {
          let { pmPolicyObjectID: t } = e;
          try {
            const e = await r.A.get(l.a.APIS.POLICIES.getPolicyByID({ id: t }));
            if (e.data && 1 == e.data.success) return new d(e.data.policy);
            throw e.data.error ? e.data.error : l.a.ERROR_CODES.SERVER_ERROR;
          } catch (a) {
            throw a;
          }
        },
        c = async (e) => {
          let { pmPolicyObjectID: t } = e;
          try {
            const e = await r.A.delete(
              l.a.APIS.POLICIES.deletePolicyByID({ id: t })
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : l.a.ERROR_CODES.SERVER_ERROR;
          } catch (a) {
            throw a;
          }
        },
        h = async () => {
          try {
            const e = await r.A.get(l.a.APIS.POLICIES.getAllPolicies());
            if (e.data && 1 == e.data.success) {
              const t = d.toList(e.data.policies);
              return console.log({ policies: t }), t;
            }
            throw e.data.error ? e.data.error : l.a.ERROR_CODES.SERVER_ERROR;
          } catch (e) {
            throw (console.log({ error: e }), e);
          }
        };
    },
    27722: (e, t, a) => {
      a.d(t, {
        $z: () => i,
        Ae: () => u,
        S6: () => d,
        UZ: () => m,
        bc: () => o,
        lE: () => y,
        oJ: () => h,
        wP: () => n,
        x9: () => c,
        xH: () => r,
      });
      var s = a(88739),
        l = a(33211);
      const r = async () => {
          try {
            const e = await l.A.get(s.a.APIS.TABLE.getAllTables());
            if (e.data && 1 == e.data.success) return e.data.tables;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (e) {
            throw e;
          }
        },
        d = async (e) => {
          let { tableName: t } = e;
          try {
            const e = await l.A.get(
              s.a.APIS.TABLE.getTableColumns({ tableName: t })
            );
            if (e.data && 1 == e.data.success)
              return Array.from(e.data.columns);
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (a) {
            throw a;
          }
        },
        o = async (e) => {
          let { tableName: t } = e;
          try {
            const e = await l.A.get(
              s.a.APIS.TABLE.getAuthorizedColumnsForAdd({ tableName: t })
            );
            if (e.data && 1 == e.data.success)
              return Array.from(e.data.columns);
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (a) {
            throw a;
          }
        },
        i = async (e) => {
          let {
            tableName: t,
            page: a = 1,
            pageSize: r = 20,
            filterQuery: d,
            sortModel: o,
          } = e;
          try {
            const e = await l.A.get(
              s.a.APIS.TABLE.getTableRows({
                tableName: t,
                page: a,
                pageSize: r,
                filterQuery: d,
                sortModel: o,
              })
            );
            if (e.data && 1 == e.data.success)
              return e.data.rows && Array.isArray(e.data.rows)
                ? { rows: e.data.rows, nextPage: e.data.nextPage }
                : { rows: [], nextPage: null };
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (i) {
            throw i;
          }
        },
        n = async (e) => {
          let { tableName: t, filterQuery: a } = e;
          try {
            const e = await l.A.get(
              s.a.APIS.TABLE.getTableStats({ tableName: t, filterQuery: a })
            );
            if (e.data && 1 == e.data.success)
              return e.data.statistics
                ? { statistics: e.data.statistics }
                : { statistics: null };
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (r) {
            throw r;
          }
        },
        c = async (e) => {
          let { tableName: t, id: a } = e;
          try {
            const e = await l.A.get(
              s.a.APIS.TABLE.getTableRowByID({ tableName: t, id: a })
            );
            if (e.data && 1 == e.data.success) return e.data.row;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (r) {
            throw r;
          }
        },
        h = async (e) => {
          let { tableName: t, id: a, data: r } = e;
          try {
            const e = await l.A.put(
              s.a.APIS.TABLE.updateTableRowByID({ tableName: t, id: a }),
              r
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (d) {
            throw d;
          }
        },
        m = async (e) => {
          let { tableName: t, data: a } = e;
          try {
            const e = await l.A.post(
              s.a.APIS.TABLE.addTableRowByID({ tableName: t }),
              a
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (r) {
            throw r;
          }
        },
        u = async (e) => {
          let { tableName: t, id: a } = e;
          try {
            const e = await l.A.delete(
              s.a.APIS.TABLE.deleteTableRowByID({ tableName: t, id: a })
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (r) {
            throw r;
          }
        },
        y = async (e) => {
          let { tableName: t, ids: a } = e;
          try {
            const e = await l.A.post(
              s.a.APIS.TABLE.deleteTableRowByMultipleIDs({ tableName: t }),
              { query: a }
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (r) {
            throw r;
          }
        };
    },
    30502: (e, t, a) => {
      a.d(t, { z: () => k });
      var s = a(68903),
        l = a(26240),
        r = a(39336),
        d = a(59395),
        o = a(24056),
        i = a(25196),
        n = a(15346),
        c = a(81747),
        h = a(72890),
        m = a(53536),
        u = a(65043);
      const y = (e, t) => t.every((t) => e.includes(t));
      var p = a(76639),
        b = a(51962),
        x = a(70579);
      const j = (e) => {
        let { label: t, value: a, handleChange: l, permissionKeys: r } = e;
        const d =
          r || Object.keys({ add: !1, edit: !1, delete: !1, read: !1, ...a });
        return (0, x.jsxs)(s.Ay, {
          container: !0,
          children: [
            t &&
              (0, x.jsx)(s.Ay, {
                item: !0,
                xs: 4,
                sm: 4,
                md: 4,
                lg: 4,
                xl: 4,
                className: "!flex !justify-start !items-center",
                children: t,
              }),
            null === d || void 0 === d
              ? void 0
              : d.map((e) =>
                  (0, x.jsxs)(s.Ay, {
                    item: !0,
                    xs: 2,
                    sm: 2,
                    md: 2,
                    lg: 2,
                    xl: 2,
                    className: "!flex !justify-start !items-center !flex-row",
                    children: [
                      (0, x.jsx)("label", {
                        className: "!capitalize",
                        children: e,
                      }),
                      (0, x.jsx)(b.A, {
                        checked: Boolean(a[e]),
                        onChange: (t) => {
                          ((e, t) => {
                            l({ ...a, [e]: t });
                          })(e, t.target.checked);
                        },
                        inputProps: { "aria-label": "controlled" },
                      }),
                    ],
                  })
                ),
          ],
        });
      };
      var f = a(87895);
      const g = (e) => {
          let { value: t, handleChange: a } = e;
          const { themeType: s } = (0, f.i7)(),
            [b, g] = (0, u.useState)(
              y(["add", "edit", "read", "delete"], Object.keys(t)) &&
                Object.keys(t).every((e) => "boolean" === typeof t[e])
                ? 0
                : 1
            ),
            R = (0, l.A)();
          return (0, x.jsxs)("div", {
            className:
              "!flex flex-col justify-start items-stretch w-full mt-4  border rounded",
            style: { borderColor: R.palette.divider },
            children: [
              (0, x.jsx)("span", {
                style: { background: R.palette.background.paper },
                className: "!font-bold pl-2 py-2 rounded-t",
                children: (0, m.capitalize)("Dashboards"),
              }),
              (0, x.jsx)(r.A, {}),
              (0, x.jsxs)("div", {
                className: "!flex flex-col justify-start items-stretch w-full ",
                children: [
                  (0, x.jsxs)(d.A, {
                    value: b,
                    onChange: () => {
                      1 === b
                        ? y(
                            ["add", "edit", "read", "delete"],
                            Object.keys(t)
                          ) &&
                          Object.keys(t).every((e) => "boolean" == typeof t[e])
                          ? g(0)
                          : (console.log(t),
                            (0, p.jx)({
                              message:
                                "JSON based policy detected. Please remove it to use visual editor",
                            }))
                        : 0 === b && g(1);
                    },
                    className: "!min-h-0",
                    children: [
                      (0, x.jsx)(o.A, {
                        label: "Visual editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                      (0, x.jsx)(o.A, {
                        label: "Advance editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                    ],
                  }),
                  (0, x.jsx)(r.A, {}),
                  0 === b
                    ? (0, x.jsx)("div", {
                        className: "py-2 px-4 ",
                        children: (0, x.jsx)(j, { value: t, handleChange: a }),
                      })
                    : (0, x.jsx)("div", {
                        className: "p-0",
                        children: (0, x.jsx)(h.Ay, {
                          value:
                            "object" === typeof t
                              ? JSON.stringify(t, null, 2)
                              : "string" === typeof t
                              ? t
                              : "",
                          height: "200px",
                          extensions: [(0, i.rI)("json")],
                          onChange: (e) => a(JSON.parse(e)),
                          theme: "dark" == s ? c.Ts : n.al,
                          className: "codemirror-editor-rounded-bottom",
                          style: {
                            borderWidth: 0,
                            width: "100%",
                            borderBottomRightRadius: 4,
                            borderBottomLeftRadius: 4,
                          },
                        }),
                      }),
                ],
              }),
            ],
          });
        },
        R = (e) => {
          let { value: t, handleChange: a } = e;
          const { themeType: s } = (0, f.i7)(),
            [b, g] = (0, u.useState)(
              y(["add", "edit", "read", "delete"], Object.keys(t)) &&
                Object.keys(t).every((e) => "boolean" === typeof t[e])
                ? 0
                : 1
            ),
            R = (0, l.A)();
          return (0, x.jsxs)("div", {
            className:
              "!flex flex-col justify-start items-stretch w-full mt-4  border rounded",
            style: { borderColor: R.palette.divider },
            children: [
              (0, x.jsx)("span", {
                style: { background: R.palette.background.paper },
                className: "!font-bold pl-2 py-2 rounded-t",
                children: (0, m.capitalize)("Graphs"),
              }),
              (0, x.jsx)(r.A, {}),
              (0, x.jsxs)("div", {
                className: "!flex flex-col justify-start items-stretch w-full ",
                children: [
                  (0, x.jsxs)(d.A, {
                    value: b,
                    onChange: () => {
                      1 === b
                        ? y(
                            ["add", "edit", "read", "delete"],
                            Object.keys(t)
                          ) &&
                          Object.keys(t).every((e) => "boolean" == typeof t[e])
                          ? g(0)
                          : (console.log(t),
                            (0, p.jx)({
                              message:
                                "JSON based policy detected. Please remove it to use visual editor",
                            }))
                        : 0 === b && g(1);
                    },
                    className: "!min-h-0",
                    children: [
                      (0, x.jsx)(o.A, {
                        label: "Visual editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                      (0, x.jsx)(o.A, {
                        label: "Advance editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                    ],
                  }),
                  (0, x.jsx)(r.A, {}),
                  0 === b
                    ? (0, x.jsx)("div", {
                        className: "py-2 px-4 ",
                        children: (0, x.jsx)(j, { value: t, handleChange: a }),
                      })
                    : (0, x.jsx)("div", {
                        className: "p-0",
                        children: (0, x.jsx)(h.Ay, {
                          value:
                            "object" === typeof t
                              ? JSON.stringify(t, null, 2)
                              : "string" === typeof t
                              ? t
                              : "",
                          height: "200px",
                          extensions: [(0, i.rI)("json")],
                          onChange: (e) => a(JSON.parse(e)),
                          theme: "dark" == s ? c.Ts : n.al,
                          className: "codemirror-editor-rounded-bottom",
                          style: {
                            borderWidth: 0,
                            width: "100%",
                            borderBottomRightRadius: 4,
                            borderBottomLeftRadius: 4,
                          },
                        }),
                      }),
                ],
              }),
            ],
          });
        },
        v = (e) => {
          let { value: t, handleChange: a } = e;
          const { themeType: s } = (0, f.i7)(),
            [b, g] = (0, u.useState)(
              y(["add", "edit", "read", "delete"], Object.keys(t)) &&
                Object.keys(t).every((e) => "boolean" === typeof t[e])
                ? 0
                : 1
            ),
            R = (0, l.A)();
          return (0, x.jsxs)("div", {
            className:
              "!flex flex-col justify-start items-stretch w-full mt-4  border rounded",
            style: { borderColor: R.palette.divider },
            children: [
              (0, x.jsx)("span", {
                style: { background: R.palette.background.paper },
                className: "!font-bold pl-2 py-2 rounded-t",
                children: (0, m.capitalize)("Queries"),
              }),
              (0, x.jsx)(r.A, {}),
              (0, x.jsxs)("div", {
                className: "!flex flex-col justify-start items-stretch w-full ",
                children: [
                  (0, x.jsxs)(d.A, {
                    value: b,
                    onChange: () => {
                      1 === b
                        ? y(
                            ["add", "edit", "read", "delete"],
                            Object.keys(t)
                          ) &&
                          Object.keys(t).every((e) => "boolean" == typeof t[e])
                          ? g(0)
                          : (console.log(t),
                            (0, p.jx)({
                              message:
                                "JSON based policy detected. Please remove it to use visual editor",
                            }))
                        : 0 === b && g(1);
                    },
                    className: "!min-h-0",
                    children: [
                      (0, x.jsx)(o.A, {
                        label: "Visual editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                      (0, x.jsx)(o.A, {
                        label: "Advance editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                    ],
                  }),
                  (0, x.jsx)(r.A, {}),
                  0 === b
                    ? (0, x.jsx)("div", {
                        className: "py-2 px-4 ",
                        children: (0, x.jsx)(j, { value: t, handleChange: a }),
                      })
                    : (0, x.jsx)("div", {
                        className: "p-0",
                        children: (0, x.jsx)(h.Ay, {
                          value:
                            "object" === typeof t
                              ? JSON.stringify(t, null, 2)
                              : "string" === typeof t
                              ? t
                              : "",
                          height: "200px",
                          extensions: [(0, i.rI)("json")],
                          onChange: (e) => a(JSON.parse(e)),
                          theme: "dark" == s ? c.Ts : n.al,
                          className: "codemirror-editor-rounded-bottom",
                          style: {
                            borderWidth: 0,
                            width: "100%",
                            borderBottomRightRadius: 4,
                            borderBottomLeftRadius: 4,
                          },
                        }),
                      }),
                ],
              }),
            ],
          });
        };
      var N = a(16082);
      const A = (e) => {
          let { value: t, handleChange: a } = e;
          const { themeType: s } = (0, f.i7)(),
            { dbModel: b } = (0, N.O0)(),
            g = (0, u.useMemo)(() => {
              let e = !0;
              return (
                t &&
                  Object.keys(t).forEach((a) => {
                    "object" !== typeof t[a] ||
                      (y(
                        ["add", "edit", "read", "delete"],
                        Object.keys(t[a])
                      ) &&
                        Object.keys(t[a]).every(
                          (e) => "boolean" === typeof t[a][e]
                        )) ||
                      (e = !1);
                  }),
                e
              );
            }, [t]),
            [R, v] = (0, u.useState)(g ? 0 : 1),
            A = (0, l.A)();
          return (0, x.jsxs)("div", {
            className:
              "!flex flex-col justify-start items-stretch w-full mt-4  border rounded",
            style: { borderColor: A.palette.divider },
            children: [
              (0, x.jsx)("span", {
                style: { background: A.palette.background.paper },
                className: "!font-bold pl-2 py-2 rounded-t",
                children: (0, m.capitalize)("Tables"),
              }),
              (0, x.jsx)(r.A, {}),
              (0, x.jsxs)("div", {
                className: "!flex flex-col justify-start items-stretch w-full ",
                children: [
                  (0, x.jsxs)(d.A, {
                    value: R,
                    onChange: () => {
                      1 === R
                        ? g
                          ? v(0)
                          : (0, p.jx)({
                              message:
                                "JSON based policy detected. Please remove it to use visual editor",
                            })
                        : 0 === R && v(1);
                    },
                    className: "!min-h-0",
                    children: [
                      (0, x.jsx)(o.A, {
                        label: "Visual editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                      (0, x.jsx)(o.A, {
                        label: "Advance editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                    ],
                  }),
                  (0, x.jsx)(r.A, {}),
                  0 === R
                    ? (0, x.jsx)("div", {
                        className:
                          "!flex flex-col justify-start items-stretch w-full p-3",
                        children:
                          null === b || void 0 === b
                            ? void 0
                            : b.map((e) =>
                                void 0 == t[e.name] || null == t[e.name]
                                  ? (0, x.jsx)(j, {
                                      label: (0, x.jsx)("span", {
                                        className: "capitalize",
                                        children: e.name,
                                      }),
                                      value: t[e.name]
                                        ? {
                                            add: !0,
                                            edit: !0,
                                            read: !0,
                                            delete: !0,
                                          }
                                        : {
                                            add: !1,
                                            edit: !1,
                                            read: !1,
                                            delete: !1,
                                          },
                                      handleChange: (s) => {
                                        a({ ...t, [e.name]: s });
                                      },
                                    })
                                  : void 0 != t[e.name] &&
                                    null != t[e.name] &&
                                    "boolean" === typeof t[e.name]
                                  ? (0, x.jsx)(j, {
                                      label: (0, x.jsx)("span", {
                                        className: "capitalize",
                                        children: e.name,
                                      }),
                                      value: t[e.name]
                                        ? {
                                            add: !0,
                                            edit: !0,
                                            read: !0,
                                            delete: !0,
                                          }
                                        : {
                                            add: !1,
                                            edit: !1,
                                            read: !1,
                                            delete: !1,
                                          },
                                      handleChange: (s) => {
                                        a({ ...t, [e.name]: s });
                                      },
                                    })
                                  : y(
                                      ["add", "edit", "read", "delete"],
                                      Object.keys(t[e.name])
                                    )
                                  ? (0, x.jsx)(j, {
                                      label: (0, x.jsx)("span", {
                                        className: "capitalize",
                                        children: e.name,
                                      }),
                                      value: t[e.name],
                                      handleChange: (s) => {
                                        a({ ...t, [e.name]: s });
                                      },
                                    })
                                  : (0, x.jsx)(h.Ay, {
                                      value:
                                        "object" === typeof t[e.name]
                                          ? JSON.stringify(t[e.name], null, 2)
                                          : "string" === typeof t[e.name]
                                          ? t[e.name]
                                          : "",
                                      height: "200px",
                                      extensions: [(0, i.rI)("json")],
                                      onChange: (s) => {
                                        a({
                                          ...t,
                                          [e.name]:
                                            "object" === typeof s
                                              ? s
                                              : JSON.parse(s),
                                        });
                                      },
                                      theme: "dark" == s ? c.Ts : n.al,
                                      className:
                                        "codemirror-editor-rounded-bottom",
                                      style: {
                                        borderWidth: 0,
                                        width: "100%",
                                        borderBottomRightRadius: 4,
                                        borderBottomLeftRadius: 4,
                                      },
                                    })
                              ),
                      })
                    : (0, x.jsx)("div", {
                        className: "p-0",
                        children: (0, x.jsx)(h.Ay, {
                          value:
                            "object" === typeof t
                              ? JSON.stringify(t, null, 2)
                              : "string" === typeof t
                              ? t
                              : "",
                          height: "200px",
                          extensions: [(0, i.rI)("json")],
                          onChange: (e) => a(JSON.parse(e)),
                          theme: "dark" == s ? c.Ts : n.al,
                          className: "codemirror-editor-rounded-bottom",
                          style: {
                            borderWidth: 0,
                            width: "100%",
                            borderBottomRightRadius: 4,
                            borderBottomLeftRadius: 4,
                          },
                        }),
                      }),
                ],
              }),
            ],
          });
        },
        O = (e) => {
          let { value: t, handleChange: a } = e;
          const { themeType: s } = (0, f.i7)(),
            [b, g] = (0, u.useState)(
              y(["add", "edit", "read", "delete"], Object.keys(t)) &&
                Object.keys(t).every((e) => "boolean" === typeof t[e])
                ? 0
                : 1
            ),
            R = (0, l.A)();
          return (0, x.jsxs)("div", {
            className:
              "!flex flex-col justify-start items-stretch w-full mt-4  border rounded",
            style: { borderColor: R.palette.divider },
            children: [
              (0, x.jsx)("span", {
                style: { background: R.palette.background.paper },
                className: "!font-bold pl-2 py-2 rounded-t",
                children: (0, m.capitalize)("Jobs"),
              }),
              (0, x.jsx)(r.A, {}),
              (0, x.jsxs)("div", {
                className: "!flex flex-col justify-start items-stretch w-full ",
                children: [
                  (0, x.jsxs)(d.A, {
                    value: b,
                    onChange: () => {
                      1 === b
                        ? y(
                            ["add", "edit", "read", "delete"],
                            Object.keys(t)
                          ) &&
                          Object.keys(t).every((e) => "boolean" == typeof t[e])
                          ? g(0)
                          : (console.log(t),
                            (0, p.jx)({
                              message:
                                "JSON based policy detected. Please remove it to use visual editor",
                            }))
                        : 0 === b && g(1);
                    },
                    className: "!min-h-0",
                    children: [
                      (0, x.jsx)(o.A, {
                        label: "Visual editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                      (0, x.jsx)(o.A, {
                        label: "Advance editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                    ],
                  }),
                  (0, x.jsx)(r.A, {}),
                  0 === b
                    ? (0, x.jsx)("div", {
                        className: "py-2 px-4 ",
                        children: (0, x.jsx)(j, { value: t, handleChange: a }),
                      })
                    : (0, x.jsx)("div", {
                        className: "p-0",
                        children: (0, x.jsx)(h.Ay, {
                          value:
                            "object" === typeof t
                              ? JSON.stringify(t, null, 2)
                              : "string" === typeof t
                              ? t
                              : "",
                          height: "200px",
                          extensions: [(0, i.rI)("json")],
                          onChange: (e) => a(JSON.parse(e)),
                          theme: "dark" == s ? c.Ts : n.al,
                          className: "codemirror-editor-rounded-bottom",
                          style: {
                            borderWidth: 0,
                            width: "100%",
                            borderBottomRightRadius: 4,
                            borderBottomLeftRadius: 4,
                          },
                        }),
                      }),
                ],
              }),
            ],
          });
        },
        w = (e) => {
          let { value: t, handleChange: a } = e;
          const { themeType: s } = (0, f.i7)(),
            [b, g] = (0, u.useState)(
              y(["add", "edit", "read", "delete"], Object.keys(t)) &&
                Object.keys(t).every((e) => "boolean" === typeof t[e])
                ? 0
                : 1
            ),
            R = (0, l.A)();
          return (0, x.jsxs)("div", {
            className:
              "!flex flex-col justify-start items-stretch w-full mt-4  border rounded",
            style: { borderColor: R.palette.divider },
            children: [
              (0, x.jsx)("span", {
                style: { background: R.palette.background.paper },
                className: "!font-bold pl-2 py-2 rounded-t",
                children: (0, m.capitalize)("App constants"),
              }),
              (0, x.jsx)(r.A, {}),
              (0, x.jsxs)("div", {
                className: "!flex flex-col justify-start items-stretch w-full ",
                children: [
                  (0, x.jsxs)(d.A, {
                    value: b,
                    onChange: () => {
                      1 === b
                        ? y(
                            ["add", "edit", "read", "delete"],
                            Object.keys(t)
                          ) &&
                          Object.keys(t).every((e) => "boolean" == typeof t[e])
                          ? g(0)
                          : (console.log(t),
                            (0, p.jx)({
                              message:
                                "JSON based policy detected. Please remove it to use visual editor",
                            }))
                        : 0 === b && g(1);
                    },
                    className: "!min-h-0",
                    children: [
                      (0, x.jsx)(o.A, {
                        label: "Visual editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                      (0, x.jsx)(o.A, {
                        label: "Advance editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                    ],
                  }),
                  (0, x.jsx)(r.A, {}),
                  0 === b
                    ? (0, x.jsx)("div", {
                        className: "py-2 px-4 ",
                        children: (0, x.jsx)(j, { value: t, handleChange: a }),
                      })
                    : (0, x.jsx)("div", {
                        className: "p-0",
                        children: (0, x.jsx)(h.Ay, {
                          value:
                            "object" === typeof t
                              ? JSON.stringify(t, null, 2)
                              : "string" === typeof t
                              ? t
                              : "",
                          height: "200px",
                          extensions: [(0, i.rI)("json")],
                          onChange: (e) => a(JSON.parse(e)),
                          theme: "dark" == s ? c.Ts : n.al,
                          className: "codemirror-editor-rounded-bottom",
                          style: {
                            borderWidth: 0,
                            width: "100%",
                            borderBottomRightRadius: 4,
                            borderBottomLeftRadius: 4,
                          },
                        }),
                      }),
                ],
              }),
            ],
          });
        },
        S = (e) => {
          let { value: t, handleChange: a } = e;
          const { themeType: s } = (0, f.i7)(),
            [b, g] = (0, u.useState)(
              y(["edit", "read"], Object.keys(t)) &&
                Object.keys(t).every((e) => "boolean" === typeof t[e])
                ? 0
                : 1
            ),
            R = (0, l.A)();
          return (0, x.jsxs)("div", {
            className:
              "!flex flex-col justify-start items-stretch w-full mt-4  border rounded",
            style: { borderColor: R.palette.divider },
            children: [
              (0, x.jsx)("span", {
                style: { background: R.palette.background.paper },
                className: "!font-bold pl-2 py-2 rounded-t",
                children: (0, m.capitalize)("Schemas"),
              }),
              (0, x.jsx)(r.A, {}),
              (0, x.jsxs)("div", {
                className: "!flex flex-col justify-start items-stretch w-full ",
                children: [
                  (0, x.jsxs)(d.A, {
                    value: b,
                    onChange: () => {
                      1 === b
                        ? y(["edit", "read"], Object.keys(t)) &&
                          Object.keys(t).every((e) => "boolean" == typeof t[e])
                          ? g(0)
                          : (console.log(t),
                            (0, p.jx)({
                              message:
                                "JSON based policy detected. Please remove it to use visual editor",
                            }))
                        : 0 === b && g(1);
                    },
                    className: "!min-h-0",
                    children: [
                      (0, x.jsx)(o.A, {
                        label: "Visual editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                      (0, x.jsx)(o.A, {
                        label: "Advance editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                    ],
                  }),
                  (0, x.jsx)(r.A, {}),
                  0 === b
                    ? (0, x.jsx)("div", {
                        className: "py-2 px-4 ",
                        children: (0, x.jsx)(j, {
                          value: t,
                          handleChange: a,
                          permissionKeys: ["edit", "read"],
                        }),
                      })
                    : (0, x.jsx)("div", {
                        className: "p-0",
                        children: (0, x.jsx)(h.Ay, {
                          value:
                            "object" === typeof t
                              ? JSON.stringify(t, null, 2)
                              : "string" === typeof t
                              ? t
                              : "",
                          height: "200px",
                          extensions: [(0, i.rI)("json")],
                          onChange: (e) => a(JSON.parse(e)),
                          theme: "dark" == s ? c.Ts : n.al,
                          className: "codemirror-editor-rounded-bottom",
                          style: {
                            borderWidth: 0,
                            width: "100%",
                            borderBottomRightRadius: 4,
                            borderBottomLeftRadius: 4,
                          },
                        }),
                      }),
                ],
              }),
            ],
          });
        },
        E = (e) => {
          let { value: t, handleChange: a } = e;
          const { themeType: s } = (0, f.i7)(),
            [b, g] = (0, u.useState)(
              y(["add", "edit", "read", "delete"], Object.keys(t)) &&
                Object.keys(t).every((e) => "boolean" === typeof t[e])
                ? 0
                : 1
            ),
            R = (0, l.A)();
          return (0, x.jsxs)("div", {
            className:
              "!flex flex-col justify-start items-stretch w-full mt-4  border rounded",
            style: { borderColor: R.palette.divider },
            children: [
              (0, x.jsx)("span", {
                style: { background: R.palette.background.paper },
                className: "!font-bold pl-2 py-2 rounded-t",
                children: (0, m.capitalize)("Policies"),
              }),
              (0, x.jsx)(r.A, {}),
              (0, x.jsxs)("div", {
                className: "!flex flex-col justify-start items-stretch w-full ",
                children: [
                  (0, x.jsxs)(d.A, {
                    value: b,
                    onChange: () => {
                      1 === b
                        ? y(
                            ["add", "edit", "read", "delete"],
                            Object.keys(t)
                          ) &&
                          Object.keys(t).every((e) => "boolean" == typeof t[e])
                          ? g(0)
                          : (console.log(t),
                            (0, p.jx)({
                              message:
                                "JSON based policy detected. Please remove it to use visual editor",
                            }))
                        : 0 === b && g(1);
                    },
                    className: "!min-h-0",
                    children: [
                      (0, x.jsx)(o.A, {
                        label: "Visual editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                      (0, x.jsx)(o.A, {
                        label: "Advance editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                    ],
                  }),
                  (0, x.jsx)(r.A, {}),
                  0 === b
                    ? (0, x.jsx)("div", {
                        className: "py-2 px-4 ",
                        children: (0, x.jsx)(j, { value: t, handleChange: a }),
                      })
                    : (0, x.jsx)("div", {
                        className: "p-0",
                        children: (0, x.jsx)(h.Ay, {
                          value:
                            "object" === typeof t
                              ? JSON.stringify(t, null, 2)
                              : "string" === typeof t
                              ? t
                              : "",
                          height: "200px",
                          extensions: [(0, i.rI)("json")],
                          onChange: (e) => a(JSON.parse(e)),
                          theme: "dark" == s ? c.Ts : n.al,
                          className: "codemirror-editor-rounded-bottom",
                          style: {
                            borderWidth: 0,
                            width: "100%",
                            borderBottomRightRadius: 4,
                            borderBottomLeftRadius: 4,
                          },
                        }),
                      }),
                ],
              }),
            ],
          });
        },
        C = (e) => {
          let { value: t, handleChange: a } = e;
          const { themeType: s } = (0, f.i7)(),
            [b, g] = (0, u.useState)(
              y(["add", "edit", "read", "delete"], Object.keys(t)) &&
                Object.keys(t).every((e) => "boolean" === typeof t[e])
                ? 0
                : 1
            ),
            R = (0, l.A)();
          return (0, x.jsxs)("div", {
            className:
              "!flex flex-col justify-start items-stretch w-full mt-4  border rounded",
            style: { borderColor: R.palette.divider },
            children: [
              (0, x.jsx)("span", {
                style: { background: R.palette.background.paper },
                className: "!font-bold pl-2 py-2 rounded-t",
                children: (0, m.capitalize)("Accounts"),
              }),
              (0, x.jsx)(r.A, {}),
              (0, x.jsxs)("div", {
                className: "!flex flex-col justify-start items-stretch w-full ",
                children: [
                  (0, x.jsxs)(d.A, {
                    value: b,
                    onChange: () => {
                      1 === b
                        ? y(
                            ["add", "edit", "read", "delete"],
                            Object.keys(t)
                          ) &&
                          Object.keys(t).every((e) => "boolean" == typeof t[e])
                          ? g(0)
                          : (console.log(t),
                            (0, p.jx)({
                              message:
                                "JSON based policy detected. Please remove it to use visual editor",
                            }))
                        : 0 === b && g(1);
                    },
                    className: "!min-h-0",
                    children: [
                      (0, x.jsx)(o.A, {
                        label: "Visual editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                      (0, x.jsx)(o.A, {
                        label: "Advance editor",
                        className:
                          "!font-bold !capitalize !py-2 !px-3 !min-h-0",
                        sx: { borderWidth: 1, minHeight: null, minWidth: null },
                      }),
                    ],
                  }),
                  (0, x.jsx)(r.A, {}),
                  0 === b
                    ? (0, x.jsx)("div", {
                        className: "py-2 px-4 ",
                        children: (0, x.jsx)(j, { value: t, handleChange: a }),
                      })
                    : (0, x.jsx)("div", {
                        className: "p-0",
                        children: (0, x.jsx)(h.Ay, {
                          value:
                            "object" === typeof t
                              ? JSON.stringify(t, null, 2)
                              : "string" === typeof t
                              ? t
                              : "",
                          height: "200px",
                          extensions: [(0, i.rI)("json")],
                          onChange: (e) => a(JSON.parse(e)),
                          theme: "dark" == s ? c.Ts : n.al,
                          className: "codemirror-editor-rounded-bottom",
                          style: {
                            borderWidth: 0,
                            width: "100%",
                            borderBottomRightRadius: 4,
                            borderBottomLeftRadius: 4,
                          },
                        }),
                      }),
                ],
              }),
            ],
          });
        },
        k = (e) => {
          let { policy: t, handleChange: a, containerClass: l } = e;
          return (0, x.jsx)(
            s.Ay,
            {
              item: !0,
              xs: 12,
              sm: 12,
              md: 12,
              lg: 12,
              className: l,
              children:
                t &&
                Object.keys(t).map((e) => {
                  let s = null;
                  switch (e) {
                    case "tables":
                      s = (0, x.jsx)(A, {
                        value: t[e],
                        handleChange: (s) => {
                          a({ ...t, [e]: s });
                        },
                      });
                      break;
                    case "graphs":
                      s = (0, x.jsx)(R, {
                        value: t[e],
                        handleChange: (s) => {
                          a({ ...t, [e]: s });
                        },
                      });
                      break;
                    case "queries":
                      s = (0, x.jsx)(v, {
                        value: t[e],
                        handleChange: (s) => {
                          a({ ...t, [e]: s });
                        },
                      });
                      break;
                    case "dashboards":
                      s = (0, x.jsx)(g, {
                        value: t[e],
                        handleChange: (s) => {
                          a({ ...t, [e]: s });
                        },
                      });
                      break;
                    case "jobs":
                      s = (0, x.jsx)(O, {
                        value: t[e],
                        handleChange: (s) => {
                          a({ ...t, [e]: s });
                        },
                      });
                      break;
                    case "schemas":
                      s = (0, x.jsx)(S, {
                        value: t[e],
                        handleChange: (s) => {
                          a({ ...t, [e]: s });
                        },
                      });
                      break;
                    case "app_constants":
                      s = (0, x.jsx)(w, {
                        value: t[e],
                        handleChange: (s) => {
                          a({ ...t, [e]: s });
                        },
                      });
                      break;
                    case "policies":
                      s = (0, x.jsx)(E, {
                        value: t[e],
                        handleChange: (s) => {
                          a({ ...t, [e]: s });
                        },
                      });
                      break;
                    case "accounts":
                      s = (0, x.jsx)(C, {
                        value: t[e],
                        handleChange: (s) => {
                          a({ ...t, [e]: s });
                        },
                      });
                  }
                  return s;
                }),
            },
            "_policy"
          );
        };
    },
  },
]);
//# sourceMappingURL=2545.12d9c946.chunk.js.map
