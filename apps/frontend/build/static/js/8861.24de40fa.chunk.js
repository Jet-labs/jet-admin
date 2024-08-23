"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [8861],
  {
    94085: (e, a, t) => {
      t.d(a, {
        t8: () => i,
        Jr: () => u,
        y1: () => c,
        Iu: () => m,
        kn: () => o,
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
            email: n,
            is_disabled: i,
            created_at: o,
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
            (this.email = n),
            (this.is_disabled = i),
            (this.created_at = o),
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
      var n = t(33211);
      const i = async (e) => {
          let { data: a } = e;
          try {
            const e = await n.A.post(r.a.APIS.ACCOUNT.addAccount(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        o = async (e) => {
          let { data: a } = e;
          try {
            const e = await n.A.put(r.a.APIS.ACCOUNT.updateAccount(), a);
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
            const e = await n.A.put(r.a.APIS.ACCOUNT.updatePassword(), a);
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
            const e = await n.A.get(r.a.APIS.ACCOUNT.getAccountByID({ id: a }));
            if (e.data && 1 == e.data.success) return new l(e.data.account);
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        u = async (e) => {
          let { pmAccountID: a } = e;
          try {
            const e = await n.A.delete(
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
            const e = await n.A.get(r.a.APIS.ACCOUNT.getAllAccounts());
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
    90827: (e, a, t) => {
      t.d(a, {
        eN: () => i,
        ak: () => c,
        Cw: () => u,
        Jl: () => d,
        gu: () => o,
      });
      var s,
        r = t(88739),
        l = t(33211);
      class n {
        constructor(e) {
          let {
            pm_policy_object_id: a,
            title: t,
            policy: s,
            created_at: r,
            is_disabled: l,
          } = e;
          console.log("before"),
            (this.pmPolicyObjectID = parseInt(a)),
            (this.pmPolicyObjectTitle = String(t)),
            (this.pmPolicyObject = JSON.parse(s)),
            (this.createdAt = new Date(r)),
            (this.isDisabled = new Boolean(l)),
            console.log("after");
        }
      }
      (s = n),
        (n.toList = (e) => {
          if (Array.isArray(e)) return e.map((e) => new s(e));
        });
      const i = async (e) => {
          let { data: a } = e;
          try {
            const e = await l.A.post(r.a.APIS.POLICIES.addPolicy(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        o = async (e) => {
          let { data: a } = e;
          try {
            const e = await l.A.put(r.a.APIS.POLICIES.updatePolicy(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data && e.data.error
              ? e.data.error
              : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw (console.log({ error: t }), t);
          }
        },
        d = async (e) => {
          let { pmPolicyObjectID: a } = e;
          try {
            const e = await l.A.get(r.a.APIS.POLICIES.getPolicyByID({ id: a }));
            if (e.data && 1 == e.data.success) return new n(e.data.policy);
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        c = async (e) => {
          let { pmPolicyObjectID: a } = e;
          try {
            const e = await l.A.delete(
              r.a.APIS.POLICIES.deletePolicyByID({ id: a })
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        u = async () => {
          try {
            const e = await l.A.get(r.a.APIS.POLICIES.getAllPolicies());
            if (e.data && 1 == e.data.success) {
              const a = n.toList(e.data.policies);
              return console.log({ policies: a }), a;
            }
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (e) {
            throw (console.log({ error: e }), e);
          }
        };
    },
    27722: (e, a, t) => {
      t.d(a, {
        $z: () => o,
        Ae: () => h,
        S6: () => n,
        UZ: () => m,
        bc: () => i,
        lE: () => x,
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
        n = async (e) => {
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
        o = async (e) => {
          let {
            tableName: a,
            page: t = 1,
            pageSize: l = 20,
            filterQuery: n,
            sortModel: i,
          } = e;
          try {
            const e = await r.A.get(
              s.a.APIS.TABLE.getTableRows({
                tableName: a,
                page: t,
                pageSize: l,
                filterQuery: n,
                sortModel: i,
              })
            );
            if (e.data && 1 == e.data.success)
              return e.data.rows && Array.isArray(e.data.rows)
                ? { rows: e.data.rows, nextPage: e.data.nextPage }
                : { rows: [], nextPage: null };
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (o) {
            throw o;
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
          } catch (n) {
            throw n;
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
        x = async (e) => {
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
    13733: (e, a, t) => {
      t.d(a, { B: () => p });
      var s = t(65043),
        r = t(72890),
        l = t(57643),
        n = t(95043),
        i = t(67680),
        o = t(15346),
        d = t(81747),
        c = t(26240),
        u = t(87895),
        m = t(25196),
        h = t(70579);
      const x = {
          javascript: (0, l.javascript)(),
          json: (0, n.json)(),
          sql: (0, i.sql)(),
          pgsql: (0, m.rI)("pgsql"),
        },
        p = (e) => {
          let {
            readOnly: a,
            disabled: t,
            code: l,
            setCode: n,
            language: i = "json",
            height: m = "200px",
            outlined: p = !0,
            transparent: y = !1,
            rounded: A = !0,
          } = e;
          const f = (0, c.A)(),
            R = (0, s.useRef)(),
            { themeType: E } = (0, u.i7)();
          return (0, h.jsx)(r.Ay, {
            readOnly: a || t,
            ref: R,
            value: l,
            height: m,
            width: "100%",
            maxWidth: "1000px",
            extensions: [x[i]],
            onChange: n,
            theme: "dark" == E ? d.Ts : o.al,
            basicSetup: { closeBrackets: !0, indentOnInput: !0 },
            style: {
              borderWidth: p ? 1 : 0,
              borderColor: f.palette.divider,
              borderRadius: p ? 4 : 0,
            },
            className: A ? "codemirror-editor-rounded" : "",
            indentWithTab: !0,
          });
        };
    },
    81953: (e, a, t) => {
      t.d(a, { K: () => v });
      var s = t(45903),
        r = t(26240),
        l = t(53193),
        n = t(15795),
        i = t(72221),
        o = t(32143),
        d = t(74050),
        c = t(96446),
        u = t(43845),
        m = t(931),
        h = t(76879),
        x = t(58390),
        p = t(98452),
        y = t(53536),
        A = t(86178),
        f = t.n(A),
        R = t(88739),
        E = t(13733),
        j = t(60184),
        _ = t(68903),
        b = t(25673),
        w = t(17392),
        S = t(65043),
        g = t(45394),
        N = t(70579);
      const C = (e) => {
          let { value: a, onChange: t, onDelete: s, type: l } = e;
          const n = (0, r.A)();
          return (0, N.jsx)(_.Ay, {
            item: !0,
            xs: 6,
            sm: 4,
            md: 4,
            lg: 3,
            xl: 3,
            className: "!p-1",
            children: (0, N.jsxs)("div", {
              style: {
                borderColor: n.palette.divider,
                borderWidth: 1,
                background: n.palette.background.paper,
              },
              className:
                "flex flex-row justify-start items-center rounded px-2 h-[32px]",
              children: [
                (0, N.jsx)(b.Ay, {
                  sx: { flex: 1, "& .MuiInputBase-input": { padding: 0 } },
                  placeholder: "Add value here",
                  className: "!p-0",
                  type: l,
                  value: a,
                  onChange: (e) => {
                    t(e.target.value);
                  },
                }),
                (0, N.jsx)(w.A, {
                  color: "primary",
                  "aria-label": "directions",
                  className: "!p-0",
                  onClick: s,
                  children: (0, N.jsx)(g.$8F, {
                    className: "!text-base",
                    style: { margin: 0 },
                  }),
                }),
              ],
            }),
          });
        },
        T = (e) => {
          let { handleAddValue: a, type: t } = e;
          const s = (0, r.A)(),
            [l, n] = (0, S.useState)("number" == t ? 0 : "");
          return (0, N.jsx)(_.Ay, {
            item: !0,
            xs: 6,
            sm: 4,
            md: 4,
            lg: 3,
            xl: 3,
            className: "!p-1",
            children: (0, N.jsxs)("div", {
              style: {
                borderColor: s.palette.divider,
                borderWidth: 1,
                background: s.palette.background.secondary,
              },
              className:
                "flex flex-row justify-start items-center rounded px-2 h-[32px]",
              children: [
                (0, N.jsx)(b.Ay, {
                  sx: { flex: 1, "& .MuiInputBase-input": { padding: 0 } },
                  placeholder: "Add value here",
                  className: "!p-0",
                  type: t,
                  value: l,
                  onChange: (e) => {
                    n(e.target.value);
                  },
                }),
                (0, N.jsx)(w.A, {
                  color: "primary",
                  "aria-label": "directions",
                  className: "!p-0",
                  onClick: () => a(l),
                  children: (0, N.jsx)(j.OiG, {
                    className: "!text-sm",
                    style: { margin: 0 },
                  }),
                }),
              ],
            }),
          });
        },
        O = (e) => {
          let { value: a, onChange: t, type: s } = e;
          (0, r.A)();
          const l = (e, r) => {
            const l = [...a];
            (l[e] = "number" === s ? parseInt(r) : r), t(l);
          };
          return (0, N.jsxs)(_.Ay, {
            container: !0,
            className: "!w-full !rounded !flex-grow",
            children: [
              Array.isArray(a) &&
                a.map((e, r) =>
                  (0, N.jsx)(C, {
                    value: e,
                    type: s,
                    onChange: (e) => l(r, e),
                    onDelete: () =>
                      ((e) => {
                        const s = [...a];
                        s.splice(e, 1), t(s);
                      })(r),
                  })
                ),
              (0, N.jsx)(T, {
                type: s,
                handleAddValue: (e) => {
                  const r = [...a];
                  r.push("number" === s ? parseInt(e) : e), t(r);
                },
              }),
            ],
          });
        },
        v = (e) => {
          let {
            type: a,
            isList: t,
            onChange: A,
            onBlur: _,
            value: b,
            helperText: w,
            error: S,
            name: g,
            required: C,
            readOnly: T,
            dateTimePicker: v = "normal",
            customMapping: I,
            selectOptions: D,
            setFieldValue: P,
            showDefault: B,
            language: W,
            customLabel: V,
          } = e;
          const z = (0, r.A)(),
            L = (0, s.A)("normal" === v ? m.K : h.I)((e) => {
              let { theme: a } = e;
              return { "& .MuiInputBase-input": { padding: "8.5px 14px" } };
            }),
            U = (0, y.lowerCase)(g);
          let k = null;
          switch (a) {
            case R.a.DATA_TYPES.STRING:
              k = (0, N.jsxs)(l.A, {
                fullWidth: !0,
                className: "!flex !flex-col !justify-start !items-start",
                size: "small",
                children: [
                  V ||
                    (U &&
                      (0, N.jsx)("span", {
                        className: "text-xs font-light mb-1",
                        style: { color: z.palette.text.secondary },
                        children: U,
                      })),
                  (0, N.jsx)(n.A, {
                    disabled: T,
                    required: C,
                    fullWidth: !0,
                    size: "small",
                    variant: "outlined",
                    type: "text",
                    name: g,
                    onChange: A,
                    onBlur: _,
                    value: b,
                    helperText: w,
                    error: S,
                  }),
                ],
              });
              break;
            case R.a.DATA_TYPES.COLOR:
              k = (0, N.jsxs)(l.A, {
                fullWidth: !0,
                className: "!flex !flex-col !justify-start !items-start",
                size: "small",
                children: [
                  V ||
                    (U &&
                      (0, N.jsx)("span", {
                        style: { color: z.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: U,
                      })),
                  (0, N.jsx)(n.A, {
                    disabled: T,
                    required: C,
                    fullWidth: !0,
                    size: "small",
                    variant: "outlined",
                    type: "color",
                    name: g,
                    onChange: A,
                    onBlur: _,
                    value: b,
                    helperText: w,
                    error: S,
                  }),
                ],
              });
              break;
            case R.a.DATA_TYPES.CODE:
              k = (0, N.jsxs)(l.A, {
                fullWidth: !0,
                className: "!flex !flex-col !justify-start !items-start",
                size: "small",
                children: [
                  V ||
                    (U &&
                      (0, N.jsx)("span", {
                        style: { color: z.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: U,
                      })),
                  (0, N.jsx)(E.B, {
                    disabled: T,
                    required: C,
                    fullWidth: !0,
                    size: "small",
                    variant: "outlined",
                    type: "color",
                    name: g,
                    setCode: (e) => {
                      P(g, e ? JSON.parse(e) : e);
                    },
                    onBlur: _,
                    code: b,
                    helperText: w,
                    error: S,
                  }),
                ],
              });
              break;
            case R.a.DATA_TYPES.SINGLE_SELECT:
              k = (0, N.jsxs)(l.A, {
                fullWidth: !0,
                size: "small",
                children: [
                  V ||
                    (U &&
                      (0, N.jsx)("span", {
                        style: { color: z.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: U,
                      })),
                  (0, N.jsx)(i.A, {
                    id: g,
                    value: b,
                    onChange: A,
                    onBlur: _,
                    error: S,
                    name: g,
                    disabled: T,
                    required: C,
                    fullWidth: !0,
                    size: "small",
                    children:
                      null === D || void 0 === D
                        ? void 0
                        : D.map((e) => {
                            const a = (0, y.isNull)(e.value) ? e : e.value,
                              t = e.label ? e.label : a;
                            return (0, N.jsx)(o.A, { value: a, children: t });
                          }),
                  }),
                  S &&
                    (0, N.jsx)("span", {
                      className: "mt-2 text-red-500",
                      children: S,
                    }),
                ],
              });
              break;
            case R.a.DATA_TYPES.MULTIPLE_SELECT:
              k = (0, N.jsxs)(l.A, {
                fullWidth: !0,
                size: "small",
                children: [
                  V ||
                    (U &&
                      (0, N.jsx)("span", {
                        style: { color: z.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: U,
                      })),
                  (0, N.jsx)(i.A, {
                    id: g,
                    multiple: !0,
                    value: b,
                    onChange: A,
                    onBlur: _,
                    error: S,
                    name: g,
                    disabled: T,
                    required: C,
                    fullWidth: !0,
                    size: "small",
                    input: (0, N.jsx)(d.A, {
                      id: "select-multiple-chip",
                      label: "Chip",
                      size: "small",
                    }),
                    renderValue: (e) =>
                      (0, N.jsx)(c.A, {
                        sx: { display: "flex", flexWrap: "wrap", gap: 0.5 },
                        children: e.map((e) =>
                          (0, N.jsx)(
                            u.A,
                            { label: e.label, size: "small", color: "primary" },
                            e.value
                          )
                        ),
                      }),
                    children:
                      null === D || void 0 === D
                        ? void 0
                        : D.map((e) =>
                            (0, N.jsx)(
                              o.A,
                              { value: e, children: e.label },
                              e.value
                            )
                          ),
                  }),
                  S &&
                    (0, N.jsx)("span", {
                      className: "mt-2 text-red-500 font-thin text-xs",
                      children: S,
                    }),
                ],
              });
              break;
            case R.a.DATA_TYPES.BOOLEAN:
              k = (0, N.jsxs)(l.A, {
                fullWidth: !0,
                className: "!flex !flex-col !justify-start !items-start",
                size: "small",
                children: [
                  V ||
                    (U &&
                      (0, N.jsx)("span", {
                        style: { color: z.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: U,
                      })),
                  (0, N.jsxs)(i.A, {
                    id: g,
                    name: g,
                    onChange: A,
                    onBlur: _,
                    value: Boolean(b),
                    error: S,
                    IconComponent: () =>
                      (0, N.jsx)(j.Vr3, { className: "!text-sm" }),
                    className: " !w-full",
                    required: C,
                    disabled: T,
                    children: [
                      (0, N.jsx)(o.A, {
                        value: !0,
                        className: "!break-words !whitespace-pre-line",
                        children: "True",
                      }),
                      (0, N.jsx)(o.A, {
                        value: !1,
                        className: "!break-words !whitespace-pre-line",
                        children: "False",
                      }),
                    ],
                  }),
                ],
              });
              break;
            case R.a.DATA_TYPES.DATETIME:
              k = (0, N.jsxs)(l.A, {
                fullWidth: !0,
                className:
                  "!flex !flex-col !justify-start !items-start !w-full",
                size: "small",
                children: [
                  V ||
                    (U &&
                      (0, N.jsx)("span", {
                        style: { color: z.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: U,
                      })),
                  (0, N.jsx)(x.$, {
                    dateAdapter: p.Y,
                    children: (0, N.jsx)(L, {
                      name: g,
                      onChange: A,
                      onBlur: _,
                      value: b ? f()(new Date(b)) : null,
                      helperText: w,
                      error: S,
                      className: "!w-full",
                      disabled: T,
                    }),
                  }),
                ],
              });
              break;
            case R.a.DATA_TYPES.JSON:
              k = (0, N.jsxs)(l.A, {
                fullWidth: !0,
                size: "small",
                children: [
                  V ||
                    (U &&
                      (0, N.jsx)("span", {
                        style: { color: z.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: U,
                      })),
                  (0, N.jsx)(E.B, {
                    disabled: T,
                    required: C,
                    fullWidth: !0,
                    size: "small",
                    variant: "outlined",
                    type: "color",
                    name: g,
                    setCode: (e) => {
                      P(g, e ? JSON.parse(e) : e);
                    },
                    language: W || "json",
                    onBlur: _,
                    code:
                      "object" === typeof b ? JSON.stringify(b, null, 2) : b,
                    helperText: w,
                    error: S,
                  }),
                ],
              });
              break;
            case R.a.DATA_TYPES.INT:
              var q;
              k = t
                ? (0, N.jsxs)(l.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      V ||
                        (U &&
                          (0, N.jsx)("span", {
                            style: { color: z.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: U,
                          })),
                      (0, N.jsx)(O, {
                        value: b,
                        onChange: (e) => P(g, e),
                        type: "number",
                      }),
                    ],
                  })
                : I
                ? (0, N.jsxs)(l.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      V ||
                        (U &&
                          (0, N.jsx)("span", {
                            style: { color: z.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: U,
                          })),
                      (0, N.jsx)(i.A, {
                        name: g,
                        onChange: A,
                        onBlur: _,
                        value: parseInt(b),
                        IconComponent: () =>
                          (0, N.jsx)(j.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === (q = Object.keys(I)) || void 0 === q
                            ? void 0
                            : q.map((e, a) =>
                                (0, N.jsx)(
                                  o.A,
                                  {
                                    value: parseInt(e),
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: I[e],
                                  },
                                  a
                                )
                              ),
                      }),
                    ],
                  })
                : (0, N.jsxs)(l.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      V ||
                        (U &&
                          (0, N.jsx)("span", {
                            style: { color: z.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: U,
                          })),
                      (0, N.jsx)(n.A, {
                        required: C,
                        fullWidth: !0,
                        size: "small",
                        variant: "outlined",
                        type: "number",
                        name: g,
                        onChange: A,
                        onBlur: _,
                        value: b,
                        helperText: w,
                        error: S,
                        disabled: T,
                      }),
                    ],
                  });
              break;
            case R.a.DATA_TYPES.FLOAT:
              var F;
              k = I
                ? (0, N.jsxs)(l.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      V ||
                        (U &&
                          (0, N.jsx)("span", {
                            style: { color: z.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: U,
                          })),
                      (0, N.jsx)(i.A, {
                        name: g,
                        onChange: A,
                        onBlur: _,
                        value: parseInt(b),
                        IconComponent: () =>
                          (0, N.jsx)(j.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === (F = Object.keys(I)) || void 0 === F
                            ? void 0
                            : F.map((e, a) =>
                                (0, N.jsx)(
                                  o.A,
                                  {
                                    value: parseInt(e),
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: I[e],
                                  },
                                  a
                                )
                              ),
                      }),
                    ],
                  })
                : (0, N.jsxs)(l.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      V ||
                        (U &&
                          (0, N.jsx)("span", {
                            style: { color: z.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: U,
                          })),
                      (0, N.jsx)(n.A, {
                        required: C,
                        fullWidth: !0,
                        size: "small",
                        variant: "outlined",
                        type: "number",
                        name: g,
                        onChange: A,
                        onBlur: _,
                        value: b,
                        helperText: w,
                        error: S,
                        disabled: T,
                      }),
                    ],
                  });
              break;
            case R.a.DATA_TYPES.DECIMAL:
              var M;
              k = I
                ? (0, N.jsxs)(l.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      V ||
                        (U &&
                          (0, N.jsx)("span", {
                            style: { color: z.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: U,
                          })),
                      (0, N.jsx)(i.A, {
                        name: g,
                        onChange: A,
                        onBlur: _,
                        value: parseInt(b),
                        IconComponent: () =>
                          (0, N.jsx)(j.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === (M = Object.keys(I)) || void 0 === M
                            ? void 0
                            : M.map((e, a) =>
                                (0, N.jsx)(
                                  o.A,
                                  {
                                    value: parseInt(e),
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: I[e],
                                  },
                                  a
                                )
                              ),
                      }),
                    ],
                  })
                : (0, N.jsxs)(l.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      V ||
                        (U &&
                          (0, N.jsx)("span", {
                            style: { color: z.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: U,
                          })),
                      (0, N.jsx)(n.A, {
                        required: C,
                        fullWidth: !0,
                        size: "small",
                        variant: "outlined",
                        type: "number",
                        name: g,
                        onChange: A,
                        onBlur: _,
                        value: b,
                        helperText: w,
                        error: S,
                        disabled: T,
                      }),
                    ],
                  });
              break;
            default:
              k = B
                ? (0, N.jsxs)(l.A, {
                    fullWidth: !0,
                    size: "small",
                    children: [
                      V ||
                        (U &&
                          (0, N.jsx)("span", {
                            style: { color: z.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: U,
                          })),
                      (0, N.jsx)(E.B, {
                        disabled: T,
                        required: C,
                        fullWidth: !0,
                        size: "small",
                        variant: "outlined",
                        type: "color",
                        name: g,
                        setCode: (e) => {
                          P(g, e ? JSON.parse(e) : e);
                        },
                        language: W || "json",
                        onBlur: _,
                        code:
                          "object" === typeof b
                            ? JSON.stringify(b, null, 2)
                            : b,
                        helperText: w,
                        error: S,
                      }),
                    ],
                  })
                : null;
          }
          return k;
        };
    },
    93068: (e, a, t) => {
      t.r(a), t.d(a, { default: () => T });
      var s = t(73216),
        r = t(91527),
        l = t(93747),
        n = t(47097),
        i = t(63516),
        o = (t(27722), t(26240)),
        d = t(42518),
        c = t(81637),
        u = t(68903),
        m = t(65043),
        h = t(5737),
        x = t(76639),
        p = t(88739),
        y = t(81953),
        A = t(94085),
        f = t(63248),
        R = t(45394),
        E = t(17160),
        j = t(56249),
        _ = t(70579);
      const b = (e) => {
        let { id: a, username: t } = e;
        const { pmUser: r } = (0, E.hD)(),
          l = (0, f.jE)(),
          i = (0, s.Zp)(),
          [o, c] = (0, m.useState)(!1),
          u = (0, m.useMemo)(
            () => !!r && r.extractAppConstantDeletionAuthorization(a),
            [r, a]
          ),
          {
            isPending: h,
            isSuccess: y,
            isError: b,
            error: w,
            mutate: S,
          } = (0, n.n)({
            mutationFn: (e) => {
              let { id: a } = e;
              return (0, A.Jr)({ pmAccountID: a });
            },
            retry: !1,
            onSuccess: () => {
              (0, x.qq)(p.a.STRINGS.ACCOUNT_DELETED_SUCCESS),
                l.invalidateQueries([p.a.REACT_QUERY_KEYS.ACCOUNTS]),
                i(-1),
                c(!1);
            },
            onError: (e) => {
              (0, x.jx)(e);
            },
          });
        return (
          u &&
          (0, _.jsxs)(_.Fragment, {
            children: [
              (0, _.jsx)(d.A, {
                onClick: () => {
                  c(!0);
                },
                startIcon: (0, _.jsx)(R.tW_, { className: "!text-sm" }),
                size: "medium",
                variant: "outlined",
                className: "!ml-2",
                color: "error",
                children: p.a.STRINGS.DELETE_BUTTON_TEXT,
              }),
              (0, _.jsx)(j.K, {
                open: o,
                onAccepted: () => {
                  S({ id: a });
                },
                onDecline: () => {
                  c(!1);
                },
                title: p.a.STRINGS.ACCOUNT_DELETION_CONFIRMATION_TITLE,
                message: ""
                  .concat(p.a.STRINGS.ACCOUNT_DELETION_CONFIRMATION_BODY, " - ")
                  .concat(t),
              }),
            ],
          })
        );
      };
      var w = t(53193),
        S = t(15795);
      const g = (e) => {
        let { pmUserData: a } = e;
        const t = (0, o.A)(),
          {
            isPending: s,
            isSuccess: r,
            isError: l,
            error: y,
            mutate: f,
          } = (0, n.n)({
            mutationFn: (e) => {
              let { data: a } = e;
              return (0, A.Tc)({ data: a });
            },
            retry: !1,
            onSuccess: () => {
              (0, x.qq)(p.a.STRINGS.ACCOUNT_PASSWORD_UPDATED_SUCCESS);
            },
            onError: (e) => {
              (0, x.jx)(e);
            },
          }),
          R = (0, i.Wx)({
            initialValues: {},
            validateOnMount: !1,
            validateOnChange: !1,
            validate: (e) => {
              const a = {};
              return (
                e.password != e.confirm_password &&
                  (a.password =
                    p.a.ERROR_CODES.PASSWORD_DOES_NOT_MATCH.message),
                a
              );
            },
            onSubmit: (e) => {
              f({ data: e });
            },
          });
        return (
          (0, m.useEffect)(() => {
            a &&
              (R.setFieldValue("pm_user_id", a.pm_user_id),
              R.setFieldValue("password", ""),
              R.setFieldValue("confirm_password", ""));
          }, [a]),
          a
            ? (0, _.jsxs)("div", {
                className:
                  "flex flex-col justify-start items-center w-full pb-5 mt-10",
                children: [
                  (0, _.jsxs)("div", {
                    className:
                      " flex flex-row justify-between 2xl:w-1/2 xl:w-1/2 lg:w-2/3 md:w-full w-full  mt-3",
                    children: [
                      (0, _.jsx)("div", {
                        className: "flex flex-col items-start justify-start",
                        children: (0, _.jsx)("span", {
                          className: "!text-base font-bold text-start ",
                          children:
                            p.a.STRINGS.ACCOUNT_PASSWORD_UPDATE_PAGE_TITLE,
                        }),
                      }),
                      (0, _.jsx)("div", {
                        className:
                          "flex flex-row items-center justify-end w-min ",
                        children: (0, _.jsx)(d.A, {
                          disableElevation: !0,
                          variant: "contained",
                          size: "small",
                          type: "submit",
                          startIcon:
                            s &&
                            (0, _.jsx)(c.A, { color: "inherit", size: 12 }),
                          className: "!ml-2 !w-max",
                          onClick: R.submitForm,
                          children:
                            p.a.STRINGS.ACCOUNT_PASSWORD_UPDATE_BUTTON_TEXT,
                        }),
                      }),
                    ],
                  }),
                  (0, _.jsx)("div", {
                    className:
                      "p-4 pt-0 mt-3 2xl:w-1/2 xl:w-1/2 lg:w-2/3 md:w-full w-full",
                    style: {
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: t.palette.divider,
                    },
                    children: (0, _.jsx)("form", {
                      className: "",
                      onSubmit: R.handleSubmit,
                      children: (0, _.jsxs)(u.Ay, {
                        container: !0,
                        rowSpacing: 2,
                        columnSpacing: 3,
                        className: "!mt-2",
                        children: [
                          (0, _.jsx)(
                            u.Ay,
                            {
                              item: !0,
                              xs: 12,
                              sm: 12,
                              md: 12,
                              lg: 12,
                              children: (0, _.jsxs)(w.A, {
                                fullWidth: !0,
                                className:
                                  "!flex !flex-col !justify-start !items-start",
                                size: "small",
                                children: [
                                  (0, _.jsx)("span", {
                                    className: "text-xs font-light mb-1",
                                    style: { color: t.palette.text.secondary },
                                    children: "Password",
                                  }),
                                  (0, _.jsx)(S.A, {
                                    required: !0,
                                    fullWidth: !0,
                                    size: "small",
                                    variant: "outlined",
                                    type: "password",
                                    name: "password",
                                    value: R.values.password,
                                    onBlur: R.handleBlur,
                                    onChange: R.handleChange,
                                    helperText: R.errors.password,
                                    error: Boolean(R.errors.password),
                                  }),
                                ],
                              }),
                            },
                            "password"
                          ),
                          (0, _.jsx)(
                            u.Ay,
                            {
                              item: !0,
                              xs: 12,
                              sm: 12,
                              md: 12,
                              lg: 12,
                              children: (0, _.jsxs)(w.A, {
                                fullWidth: !0,
                                className:
                                  "!flex !flex-col !justify-start !items-start",
                                size: "small",
                                children: [
                                  (0, _.jsx)("span", {
                                    className: "text-xs font-light mb-1",
                                    style: { color: t.palette.text.secondary },
                                    children: "Confirm password",
                                  }),
                                  (0, _.jsx)(S.A, {
                                    required: !0,
                                    fullWidth: !0,
                                    size: "small",
                                    variant: "outlined",
                                    type: "password",
                                    name: "confirm_password",
                                    value: R.values.confirm_password,
                                    onBlur: R.handleBlur,
                                    onChange: R.handleChange,
                                    helperText: R.errors.confirm_password,
                                    error: Boolean(R.errors.confirm_password),
                                  }),
                                ],
                              }),
                            },
                            "confirm_password"
                          ),
                        ],
                      }),
                    }),
                  }),
                ],
              })
            : (0, _.jsx)(h.R, {})
        );
      };
      var N = t(90827);
      const C = (e) => {
          let { id: a } = e;
          const t = (0, o.A)(),
            s = new r.E(),
            {
              isLoading: f,
              data: R,
              error: E,
            } = (0, l.I)({
              queryKey: [p.a.REACT_QUERY_KEYS.ACCOUNTS, a],
              queryFn: () => (0, A.y1)({ pmAccountID: a }),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            }),
            {
              isLoading: j,
              data: w,
              error: S,
            } = (0, l.I)({
              queryKey: [p.a.REACT_QUERY_KEYS.POLICIES],
              queryFn: () => (0, N.Cw)(),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            }),
            {
              isPending: C,
              isSuccess: T,
              isError: O,
              error: v,
              mutate: I,
            } = (0, n.n)({
              mutationFn: (e) => {
                let { data: a } = e;
                return (0, A.kn)({ data: a });
              },
              retry: !1,
              onSuccess: () => {
                (0, x.qq)(p.a.STRINGS.ACCOUNT_UPDATED_SUCCESS),
                  s.invalidateQueries([p.a.REACT_QUERY_KEYS.ACCOUNTS]);
              },
              onError: (e) => {
                (0, x.jx)(e);
              },
            }),
            D = (0, i.Wx)({
              initialValues: {},
              validateOnMount: !1,
              validateOnChange: !1,
              validate: (e) => ({}),
              onSubmit: (e) => {
                I({ data: e });
              },
            });
          (0, m.useEffect)(() => {
            R &&
              (D.setFieldValue("pm_user_id", R.pm_user_id),
              D.setFieldValue("first_name", R.first_name),
              D.setFieldValue("last_name", R.last_name),
              D.setFieldValue("address1", R.address1),
              D.setFieldValue("pm_policy_object_id", R.pm_policy_object_id));
          }, [R]);
          const P = (0, m.useMemo)(() => {
            const e = {};
            return w
              ? (w.forEach((a) => {
                  e[a.pmPolicyObjectID] = a.pmPolicyObjectTitle;
                }),
                e)
              : null;
          }, [w]);
          return f || j || !R
            ? (0, _.jsx)(h.R, {})
            : (0, _.jsxs)("div", {
                className:
                  "flex flex-col justify-start items-center w-full pb-5 p-2",
                children: [
                  (0, _.jsxs)("div", {
                    className:
                      " flex flex-row justify-between 2xl:w-1/2 xl:w-1/2 lg:w-2/3 md:w-full w-full  mt-3",
                    children: [
                      (0, _.jsxs)("div", {
                        className: "flex flex-col items-start justify-start",
                        children: [
                          (0, _.jsx)("span", {
                            className: "text-lg font-bold text-start ",
                            children: p.a.STRINGS.ACCOUNT_UPDATE_PAGE_TITLE,
                          }),
                          (0, _.jsx)("span", {
                            className: "text-xs font-thin text-start ",
                            style: { color: t.palette.text.secondary },
                            children: "User ID : "
                              .concat(R.pm_user_id, " | Username : ")
                              .concat(R.username),
                          }),
                        ],
                      }),
                      (0, _.jsxs)("div", {
                        className:
                          "flex flex-row items-center justify-end w-min ",
                        children: [
                          (0, _.jsx)(b, { id: a, username: R.username }),
                          (0, _.jsx)(d.A, {
                            disableElevation: !0,
                            variant: "contained",
                            size: "small",
                            type: "submit",
                            startIcon:
                              C &&
                              (0, _.jsx)(c.A, { color: "inherit", size: 12 }),
                            className: "!ml-2",
                            onClick: D.submitForm,
                            children: p.a.STRINGS.UPDATE_BUTTON_TEXT,
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, _.jsx)("div", {
                    className:
                      "p-4 pt-0 mt-3 2xl:w-1/2 xl:w-1/2 lg:w-2/3 md:w-full w-full",
                    style: {
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: t.palette.divider,
                    },
                    children: (0, _.jsx)("form", {
                      className: "",
                      onSubmit: D.handleSubmit,
                      children: (0, _.jsxs)(u.Ay, {
                        container: !0,
                        rowSpacing: 2,
                        columnSpacing: 3,
                        className: "!mt-2",
                        children: [
                          (0, _.jsx)(
                            u.Ay,
                            {
                              item: !0,
                              xs: 12,
                              sm: 12,
                              md: 12,
                              lg: 12,
                              children: (0, _.jsx)(y.K, {
                                type: "String",
                                name: "first_name",
                                readOnly: !1,
                                value: D.values.first_name,
                                onBlur: D.handleBlur,
                                onChange: D.handleChange,
                                setFieldValue: D.setFieldValue,
                                helperText: D.errors.first_name,
                                error: Boolean(D.errors.first_name),
                                required: !1,
                                customMapping: null,
                              }),
                            },
                            "first_name"
                          ),
                          (0, _.jsx)(
                            u.Ay,
                            {
                              item: !0,
                              xs: 12,
                              sm: 12,
                              md: 12,
                              lg: 12,
                              children: (0, _.jsx)(y.K, {
                                type: "String",
                                name: "last_name",
                                readOnly: !1,
                                value: D.values.last_name,
                                onBlur: D.handleBlur,
                                onChange: D.handleChange,
                                setFieldValue: D.setFieldValue,
                                helperText: D.errors.last_name,
                                error: Boolean(D.errors.last_name),
                                required: !1,
                                customMapping: null,
                              }),
                            },
                            "last_name"
                          ),
                          (0, _.jsx)(
                            u.Ay,
                            {
                              item: !0,
                              xs: 12,
                              sm: 12,
                              md: 12,
                              lg: 12,
                              children: (0, _.jsx)(y.K, {
                                type: "String",
                                name: "address1",
                                readOnly: !1,
                                value: D.values.address1,
                                onBlur: D.handleBlur,
                                onChange: D.handleChange,
                                setFieldValue: D.setFieldValue,
                                helperText: D.errors.address1,
                                error: Boolean(D.errors.address1),
                                required: !1,
                                customMapping: null,
                              }),
                            },
                            "address1"
                          ),
                          (0, _.jsx)(
                            u.Ay,
                            {
                              item: !0,
                              xs: 12,
                              sm: 12,
                              md: 12,
                              lg: 12,
                              children: (0, _.jsx)(y.K, {
                                type: "Int",
                                name: "pm_policy_object_id",
                                value: D.values.pm_policy_object_id,
                                onBlur: D.handleBlur,
                                onChange: D.handleChange,
                                setFieldValue: D.setFieldValue,
                                helperText: D.errors.pm_policy_object_id,
                                error: Boolean(D.errors.pm_policy_object_id),
                                required: !0,
                                customMapping: P,
                              }),
                            },
                            "pm_policy_object_id"
                          ),
                        ],
                      }),
                    }),
                  }),
                  R && (0, _.jsx)(g, { pmUserData: R }),
                ],
              });
        },
        T = () => {
          const { id: e } = (0, s.g)();
          return (0, _.jsx)(C, { id: e });
        };
    },
    26600: (e, a, t) => {
      t.d(a, { A: () => y });
      var s = t(58168),
        r = t(98587),
        l = t(65043),
        n = t(58387),
        i = t(68606),
        o = t(85865),
        d = t(34535),
        c = t(98206),
        u = t(87034),
        m = t(2563),
        h = t(70579);
      const x = ["className", "id"],
        p = (0, d.Ay)(o.A, {
          name: "MuiDialogTitle",
          slot: "Root",
          overridesResolver: (e, a) => a.root,
        })({ padding: "16px 24px", flex: "0 0 auto" }),
        y = l.forwardRef(function (e, a) {
          const t = (0, c.b)({ props: e, name: "MuiDialogTitle" }),
            { className: o, id: d } = t,
            y = (0, r.A)(t, x),
            A = t,
            f = ((e) => {
              const { classes: a } = e;
              return (0, i.A)({ root: ["root"] }, u.t, a);
            })(A),
            { titleId: R = d } = l.useContext(m.A);
          return (0,
          h.jsx)(p, (0, s.A)({ component: "h2", className: (0, n.A)(f.root, o), ownerState: A, ref: a, variant: "h6", id: null != d ? d : R }, y));
        });
    },
  },
]);
//# sourceMappingURL=8861.24de40fa.chunk.js.map
