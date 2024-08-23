"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [2836],
  {
    94085: (e, a, t) => {
      t.d(a, {
        t8: () => d,
        Jr: () => u,
        y1: () => c,
        Iu: () => m,
        kn: () => i,
        Tc: () => n,
      });
      var r,
        s = t(88739);
      class l {
        constructor(e) {
          let {
            pm_user_id: a,
            username: t,
            first_name: r,
            address1: s,
            pm_policy_object_id: l,
            email: o,
            is_disabled: d,
            created_at: i,
            updated_at: n,
            disabled_at: c,
            disable_reason: u,
            tbl_pm_policy_objects: m,
          } = e;
          (this.pm_user_id = a),
            (this.username = t),
            (this.first_name = r),
            (this.address1 = s),
            (this.pm_policy_object_id = l),
            (this.email = o),
            (this.is_disabled = d),
            (this.created_at = i),
            (this.updated_at = n),
            (this.disabled_at = c),
            (this.disable_reason = u),
            (this.is_profile_complete =
              this.first_name && this.email && this.address1),
            (this.tbl_pm_policy_objects = m),
            (this.policy = m ? m.policy : null);
        }
      }
      (r = l),
        (l.toList = (e) => {
          if (Array.isArray(e)) return e.map((e) => new r(e));
        });
      var o = t(33211);
      const d = async (e) => {
          let { data: a } = e;
          try {
            const e = await o.A.post(s.a.APIS.ACCOUNT.addAccount(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        i = async (e) => {
          let { data: a } = e;
          try {
            const e = await o.A.put(s.a.APIS.ACCOUNT.updateAccount(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data && e.data.error
              ? e.data.error
              : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw (console.log({ error: t }), t);
          }
        },
        n = async (e) => {
          let { data: a } = e;
          try {
            const e = await o.A.put(s.a.APIS.ACCOUNT.updatePassword(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data && e.data.error
              ? e.data.error
              : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw (console.log({ error: t }), t);
          }
        },
        c = async (e) => {
          let { pmAccountID: a } = e;
          try {
            const e = await o.A.get(s.a.APIS.ACCOUNT.getAccountByID({ id: a }));
            if (e.data && 1 == e.data.success) return new l(e.data.account);
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        u = async (e) => {
          let { pmAccountID: a } = e;
          try {
            const e = await o.A.delete(
              s.a.APIS.ACCOUNT.deleteAccountByID({ id: a })
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        m = async () => {
          try {
            const e = await o.A.get(s.a.APIS.ACCOUNT.getAllAccounts());
            if (e.data && 1 == e.data.success) {
              const a = l.toList(e.data.accounts);
              return console.log({ accounts: a }), a;
            }
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (e) {
            throw (console.log({ error: e }), e);
          }
        };
    },
    90827: (e, a, t) => {
      t.d(a, {
        eN: () => d,
        ak: () => c,
        Cw: () => u,
        Jl: () => n,
        gu: () => i,
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
      const d = async (e) => {
          let { data: a } = e;
          try {
            const e = await l.A.post(s.a.APIS.POLICIES.addPolicy(), a);
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        i = async (e) => {
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
        n = async (e) => {
          let { pmPolicyObjectID: a } = e;
          try {
            const e = await l.A.get(s.a.APIS.POLICIES.getPolicyByID({ id: a }));
            if (e.data && 1 == e.data.success) return new o(e.data.policy);
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (t) {
            throw t;
          }
        },
        c = async (e) => {
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
        u = async () => {
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
        $z: () => i,
        Ae: () => R,
        S6: () => o,
        UZ: () => m,
        bc: () => d,
        lE: () => h,
        oJ: () => u,
        wP: () => n,
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
        d = async (e) => {
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
        i = async (e) => {
          let {
            tableName: a,
            page: t = 1,
            pageSize: l = 20,
            filterQuery: o,
            sortModel: d,
          } = e;
          try {
            const e = await s.A.get(
              r.a.APIS.TABLE.getTableRows({
                tableName: a,
                page: t,
                pageSize: l,
                filterQuery: o,
                sortModel: d,
              })
            );
            if (e.data && 1 == e.data.success)
              return e.data.rows && Array.isArray(e.data.rows)
                ? { rows: e.data.rows, nextPage: e.data.nextPage }
                : { rows: [], nextPage: null };
            throw e.data.error ? e.data.error : r.a.ERROR_CODES.SERVER_ERROR;
          } catch (i) {
            throw i;
          }
        },
        n = async (e) => {
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
        R = async (e) => {
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
        h = async (e) => {
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
    2215: (e, a, t) => {
      t.d(a, { H: () => p });
      var r = t(63248),
        s = t(93747),
        l = t(47097),
        o = t(63516),
        d = t(26240),
        i = t(42518),
        n = t(81637),
        c = t(68903),
        u = t(65043),
        m = t(27722),
        R = t(88739),
        h = t(76639),
        E = t(6881),
        y = t(22168),
        _ = t(81953),
        w = t(70579);
      const p = (e) => {
        let { tableName: a, customTitle: t } = e;
        const p = (0, d.A)(),
          A = (0, r.jE)(),
          {
            isLoading: S,
            data: x,
            error: O,
          } = (0, s.I)({
            queryKey: [
              "REACT_QUERY_KEY_TABLES_".concat(String(a).toUpperCase()),
              "add_column",
            ],
            queryFn: () => (0, m.bc)({ tableName: a }),
            cacheTime: 0,
            retry: 1,
            staleTime: 0,
          }),
          f = (0, u.useMemo)(() => {
            if (x) {
              return (0, E.Kt)(x);
            }
            return null;
          }, [x]),
          {
            isPending: b,
            isSuccess: g,
            isError: C,
            error: j,
            mutate: I,
          } = (0, l.n)({
            mutationFn: (e) => {
              let { tableName: a, data: t } = e;
              return (0, m.UZ)({ tableName: a, data: t });
            },
            retry: !1,
            onSuccess: () => {
              (0, h.qq)("Added record successfully"),
                A.invalidateQueries([
                  "REACT_QUERY_KEY_TABLES_".concat(String(a).toUpperCase()),
                ]);
            },
            onError: (e) => {
              (0, h.jx)(e);
            },
          }),
          N = (0, o.Wx)({
            initialValues: {},
            validateOnMount: !1,
            validateOnChange: !1,
            validate: (e) => ({}),
            onSubmit: (e) => {
              I({ tableName: a, data: e });
            },
          });
        return f && f.length > 0
          ? (0, w.jsxs)("div", {
              className:
                "flex flex-col justify-start items-center w-full pb-5 p-2",
              children: [
                (0, w.jsxs)("div", {
                  className:
                    " flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full mt-3 ",
                  children: [
                    (0, w.jsxs)("div", {
                      className: "flex flex-col items-start justify-start",
                      children: [
                        (0, w.jsx)("span", {
                          className: "text-lg font-bold text-start ",
                          children: t || "Add row",
                        }),
                        (0, w.jsx)("span", {
                          style: { color: p.palette.text.secondary },
                          className:
                            "text-xs font-thin text-start text-slate-300",
                          children: "Table : ".concat(a),
                        }),
                      ],
                    }),
                    (0, w.jsx)("div", {
                      className: "flex flex-row items-center justify-end w-min",
                      children: (0, w.jsx)(i.A, {
                        disableElevation: !0,
                        variant: "contained",
                        size: "small",
                        type: "submit",
                        startIcon:
                          b && (0, w.jsx)(n.A, { color: "inherit", size: 12 }),
                        className: "!ml-2",
                        onClick: N.handleSubmit,
                        children: (0, w.jsx)("span", {
                          className: "!w-max",
                          children: "Add record",
                        }),
                      }),
                    }),
                  ],
                }),
                (0, w.jsx)("div", {
                  className:
                    "px-4 mt-3 w-full 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full pb-3",
                  style: {
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: p.palette.divider,
                  },
                  children: (0, w.jsx)("form", {
                    onSubmit: N.handleSubmit,
                    children: (0, w.jsx)(c.Ay, {
                      container: !0,
                      spacing: { xs: 1, md: 2 },
                      columns: { xs: 1, sm: 1, md: 2 },
                      className: "!mt-2",
                      children: f.map((e, a) =>
                        (0, w.jsx)(
                          c.Ay,
                          {
                            item: !0,
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 12,
                            children: (0, w.jsx)(_.K, {
                              type: e.type,
                              name: e.field,
                              value: N.values[e.field],
                              onBlur: N.handleBlur,
                              onChange: N.handleChange,
                              helperText: N.errors[e.field],
                              error: Boolean(N.errors[e.field]),
                              setFieldValue: N.setFieldValue,
                              isList: e.isList,
                            }),
                          },
                          a
                        )
                      ),
                    }),
                  }),
                }),
              ],
            })
          : (0, w.jsx)("div", {
              className: "p-3",
              children: (0, w.jsx)(y.A, {
                error: R.a.ERROR_CODES.PERMISSION_DENIED,
              }),
            });
      };
    },
    42836: (e, a, t) => {
      t.r(a), t.d(a, { default: () => p });
      var r = t(63248),
        s = t(93747),
        l = t(47097),
        o = t(63516),
        d = t(26240),
        i = t(42518),
        n = t(81637),
        c = t(68903),
        u = t(65043),
        m = t(94085),
        R = t(90827),
        h = t(88739),
        E = t(76639),
        y = t(81953),
        _ = t(70579);
      const w = (e) => {
        let { tableName: a } = e;
        const t = (0, d.A)(),
          w = (0, r.jE)(),
          {
            isLoading: p,
            data: A,
            error: S,
          } = (0, s.I)({
            queryKey: [h.a.REACT_QUERY_KEYS.POLICIES],
            queryFn: () => (0, R.Cw)(),
            cacheTime: 0,
            retry: 1,
            staleTime: 0,
          }),
          x = (0, u.useMemo)(() => {
            const e = {};
            return A
              ? (A.forEach((a) => {
                  e[a.pmPolicyObjectID] = a.pmPolicyObjectTitle;
                }),
                e)
              : null;
          }, [A]),
          {
            isPending: O,
            isSuccess: f,
            isError: b,
            error: g,
            mutate: C,
          } = (0, l.n)({
            mutationFn: (e) => {
              let { data: a } = e;
              return (0, m.t8)({ data: a });
            },
            retry: !1,
            onSuccess: () => {
              (0, E.qq)(h.a.STRINGS.ACCOUNT_ADDITION_SUCCESS),
                w.invalidateQueries([h.a.REACT_QUERY_KEYS.ACCOUNTS]);
            },
            onError: (e) => {
              (0, E.jx)(e);
            },
          }),
          j = (0, o.Wx)({
            initialValues: {
              username: "",
              first_name: "",
              last_name: "",
              password: "",
              pm_policy_object_id: "",
              address1: "",
            },
            validateOnMount: !1,
            validateOnChange: !1,
            validate: (e) => ({}),
            onSubmit: (e) => {
              C({ data: e });
            },
          });
        return (0, _.jsxs)("div", {
          className: "flex flex-col justify-start items-center w-full pb-5 p-2",
          children: [
            (0, _.jsxs)("div", {
              className:
                " flex flex-row justify-between 2xl:w-1/2 xl:w-1/2 lg:w-2/3 md:w-full w-full mt-3 ",
              children: [
                (0, _.jsx)("div", {
                  className: "flex flex-col items-start justify-start",
                  children: (0, _.jsx)("span", {
                    className: "text-lg font-bold text-start ",
                    children: h.a.STRINGS.ACCOUNT_ADDITION_PAGE_TITLE,
                  }),
                }),
                (0, _.jsx)("div", {
                  className: "flex flex-row items-center justify-end w-min",
                  children: (0, _.jsx)(i.A, {
                    disableElevation: !0,
                    variant: "contained",
                    size: "small",
                    type: "submit",
                    startIcon:
                      O && (0, _.jsx)(n.A, { color: "inherit", size: 12 }),
                    className: "!ml-2",
                    onClick: j.handleSubmit,
                    children: (0, _.jsx)("span", {
                      className: "!w-max",
                      children: h.a.STRINGS.ADD_BUTTON_TEXT,
                    }),
                  }),
                }),
              ],
            }),
            (0, _.jsx)("div", {
              className:
                "px-4 mt-3 w-full 2xl:w-1/2 xl:w-1/2 lg:w-2/3 md:w-full pb-3",
              style: {
                borderRadius: 4,
                borderWidth: 1,
                borderColor: t.palette.divider,
              },
              children: (0, _.jsx)("form", {
                onSubmit: j.handleSubmit,
                children: (0, _.jsxs)(c.Ay, {
                  container: !0,
                  spacing: { xs: 1, md: 2 },
                  columns: { xs: 1, sm: 1, md: 2 },
                  className: "!mt-2",
                  children: [
                    (0, _.jsx)(
                      c.Ay,
                      {
                        item: !0,
                        xs: 12,
                        sm: 12,
                        md: 12,
                        lg: 12,
                        children: (0, _.jsx)(y.K, {
                          type: "String",
                          name: "username",
                          readOnly: !1,
                          value: j.values.username,
                          onBlur: j.handleBlur,
                          onChange: j.handleChange,
                          setFieldValue: j.setFieldValue,
                          helperText: j.errors.username,
                          error: Boolean(j.errors.username),
                          required: !0,
                          customMapping: null,
                        }),
                      },
                      "username"
                    ),
                    (0, _.jsx)(
                      c.Ay,
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
                          value: j.values.first_name,
                          onBlur: j.handleBlur,
                          onChange: j.handleChange,
                          setFieldValue: j.setFieldValue,
                          helperText: j.errors.first_name,
                          error: Boolean(j.errors.first_name),
                          required: !1,
                          customMapping: null,
                        }),
                      },
                      "first_name"
                    ),
                    (0, _.jsx)(
                      c.Ay,
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
                          value: j.values.last_name,
                          onBlur: j.handleBlur,
                          onChange: j.handleChange,
                          setFieldValue: j.setFieldValue,
                          helperText: j.errors.last_name,
                          error: Boolean(j.errors.last_name),
                          required: !1,
                          customMapping: null,
                        }),
                      },
                      "last_name"
                    ),
                    (0, _.jsx)(
                      c.Ay,
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
                          value: j.values.address1,
                          onBlur: j.handleBlur,
                          onChange: j.handleChange,
                          setFieldValue: j.setFieldValue,
                          helperText: j.errors.address1,
                          error: Boolean(j.errors.address1),
                          required: !1,
                          customMapping: null,
                        }),
                      },
                      "address1"
                    ),
                    (0, _.jsx)(
                      c.Ay,
                      {
                        item: !0,
                        xs: 12,
                        sm: 12,
                        md: 12,
                        lg: 12,
                        children: (0, _.jsx)(y.K, {
                          type: "Int",
                          name: "pm_policy_object_id",
                          value: j.values.pm_policy_object_id,
                          onBlur: j.handleBlur,
                          onChange: j.handleChange,
                          setFieldValue: j.setFieldValue,
                          helperText: j.errors.pm_policy_object_id,
                          error: Boolean(j.errors.pm_policy_object_id),
                          required: !0,
                          customMapping: x,
                        }),
                      },
                      "pm_policy_object_id"
                    ),
                    (0, _.jsx)(
                      c.Ay,
                      {
                        item: !0,
                        xs: 12,
                        sm: 12,
                        md: 12,
                        lg: 12,
                        children: (0, _.jsx)(y.K, {
                          type: "String",
                          name: "password",
                          value: j.values.password,
                          onBlur: j.handleBlur,
                          onChange: j.handleChange,
                          helperText: j.errors.password,
                          error: Boolean(j.errors.password),
                          setFieldValue: j.setFieldValue,
                        }),
                      },
                      "password"
                    ),
                  ],
                }),
              }),
            }),
          ],
        });
      };
      t(2215);
      const p = (e) => {
        let {} = e;
        return (0, _.jsx)("div", {
          className: "flex flex-col justify-start items-stretch w-full h-full",
          children: (0, _.jsx)(w, {}),
        });
      };
    },
  },
]);
//# sourceMappingURL=2836.3ee0ac60.chunk.js.map
