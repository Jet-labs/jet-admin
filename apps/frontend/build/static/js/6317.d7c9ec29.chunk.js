"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [6317],
  {
    89516: (e, t, l) => {
      l.r(t), l.d(t, { default: () => C });
      var a = l(73216),
        s = l(91527),
        r = l(93747),
        i = l(47097),
        n = l(63516),
        o = l(27722),
        c = l(26240),
        d = l(42518),
        u = l(81637),
        m = l(68903),
        x = l(65043),
        f = l(5737),
        p = l(81953),
        h = l(88739),
        j = l(76639),
        N = l(6881),
        v = l(22168),
        E = l(63248),
        b = l(45394),
        w = l(17160),
        y = l(56249),
        A = l(70579);
      const g = (e) => {
        let { tableName: t, id: l } = e;
        const { pmUser: s } = (0, w.hD)(),
          r = (0, E.jE)(),
          n = (0, a.Zp)(),
          [c, u] = (0, x.useState)(!1),
          m = (0, x.useMemo)(() => {
            if (s && s && t) {
              return !!s.extractRowDeleteAuthorization(t);
            }
            return !1;
          }, [s, t]),
          {
            isPending: f,
            isSuccess: p,
            isError: h,
            error: N,
            mutate: v,
          } = (0, i.n)({
            mutationFn: (e) => {
              let { tableName: t, id: l } = e;
              return (0, o.Ae)({ tableName: t, id: l });
            },
            retry: !1,
            onSuccess: () => {
              (0, j.qq)("Deleted row successfully"),
                u(!1),
                n(-1),
                r.invalidateQueries([
                  "REACT_QUERY_KEY_TABLES_".concat(String(t).toUpperCase()),
                ]);
            },
            onError: (e) => {
              (0, j.jx)(e);
            },
          });
        return (
          m &&
          (0, A.jsxs)(A.Fragment, {
            children: [
              (0, A.jsx)(d.A, {
                onClick: () => {
                  u(!0);
                },
                startIcon: (0, A.jsx)(b.tW_, { className: "!text-sm" }),
                size: "medium",
                variant: "outlined",
                className: "!ml-2",
                color: "error",
                children: "Delete",
              }),
              (0, A.jsx)(y.K, {
                open: c,
                onAccepted: () => {
                  v({ tableName: t, id: l });
                },
                onDecline: () => {
                  u(!1);
                },
                title: "Delete row?",
                message: "Are you sure you want to delete row id - ".concat(l),
              }),
            ],
          })
        );
      };
      var _ = l(16082);
      const S = (e) => {
          let { customTitle: t, tableName: l, id: a } = e;
          const E = new s.E(),
            { internalAppVariables: b } = (0, _.O0)(),
            w = (0, c.A)(),
            {
              isLoading: y,
              data: S,
              error: C,
            } = (0, r.I)({
              queryKey: [
                "REACT_QUERY_KEY_TABLES_".concat(String(l).toUpperCase()),
                a,
              ],
              queryFn: () => (0, o.x9)({ tableName: l, id: a }),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            }),
            {
              isLoading: T,
              data: R,
              error: D,
            } = (0, r.I)({
              queryKey: [
                "REACT_QUERY_KEY_TABLES_".concat(String(l).toUpperCase()),
                "edit_column",
              ],
              queryFn: () => (0, o.S6)({ tableName: l }),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            }),
            U = (0, x.useMemo)(() => {
              if (R) {
                return (0, N.Kt)(R);
              }
              return null;
            }, [R]);
          (0, x.useEffect)(() => {
            S &&
              U &&
              U.forEach((e) => {
                L.setFieldValue("".concat(e.field), S[e.field]);
              });
          }, [S, U]);
          const {
              isPending: I,
              isSuccess: F,
              isError: K,
              error: M,
              mutate: q,
            } = (0, i.n)({
              mutationFn: (e) => {
                let { tableName: t, id: l, data: a } = e;
                return (0, o.oJ)({ tableName: t, id: l, data: a });
              },
              retry: !1,
              onSuccess: () => {
                (0, j.qq)("Updated row successfully"),
                  E.invalidateQueries([
                    "REACT_QUERY_KEY_TABLES_".concat(String(l).toUpperCase()),
                  ]);
              },
              onError: (e) => {
                (0, j.jx)(e);
              },
            }),
            L = (0, n.Wx)({
              initialValues: {},
              validateOnMount: !1,
              validateOnChange: !1,
              validate: (e) => ({}),
              onSubmit: (e) => {
                q({ tableName: l, id: a, data: e });
              },
            });
          return (null === U || void 0 === U ? void 0 : U.length) > 0
            ? (0, A.jsxs)("div", {
                className:
                  "flex flex-col justify-start items-center w-full pb-5 p-2 overflow-y-scroll",
                children: [
                  (0, A.jsxs)("div", {
                    className:
                      " flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full  mt-3 w-full ",
                    children: [
                      (0, A.jsxs)("div", {
                        className: "flex flex-col items-start justify-start",
                        children: [
                          (0, A.jsx)("span", {
                            className: "text-lg font-bold text-start ",
                            children: t || "Update row",
                          }),
                          l &&
                            (0, A.jsx)("span", {
                              style: { color: w.palette.text.secondary },
                              className:
                                "text-xs font-thin text-start text-slate-300",
                              children: "Table : "
                                .concat(l, " | Entry ID : ")
                                .concat(a),
                            }),
                        ],
                      }),
                      (0, A.jsxs)("div", {
                        className:
                          "flex flex-row items-center justify-end w-min ",
                        children: [
                          (0, A.jsx)(g, { tableName: l, id: a }),
                          (0, A.jsx)(d.A, {
                            disableElevation: !0,
                            variant: "contained",
                            size: "small",
                            type: "submit",
                            startIcon:
                              I &&
                              (0, A.jsx)(u.A, { color: "inherit", size: 12 }),
                            className: "!ml-2",
                            onClick: L.submitForm,
                            children: "Update",
                          }),
                        ],
                      }),
                    ],
                  }),
                  y
                    ? (0, A.jsx)(f.R, {})
                    : (0, A.jsx)("div", {
                        className:
                          "px-4 mt-3 w-full 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full pb-3",
                        style: {
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: w.palette.divider,
                        },
                        children: (0, A.jsx)("form", {
                          className: "",
                          onSubmit: L.handleSubmit,
                          children: (0, A.jsx)(m.Ay, {
                            container: !0,
                            rowSpacing: 2,
                            columnSpacing: 3,
                            className: "!mt-2",
                            children: U.map((e, t) => {
                              var a, s;
                              return (0, A.jsx)(
                                m.Ay,
                                {
                                  item: !0,
                                  xs: 12,
                                  sm: 12,
                                  md: 12,
                                  lg: 12,
                                  children: (0, A.jsx)(p.K, {
                                    type: e.type,
                                    name: e.field,
                                    isList: e.isList,
                                    value: L.values[e.field],
                                    onBlur: L.handleBlur,
                                    onChange: L.handleChange,
                                    setFieldValue: L.setFieldValue,
                                    helperText: L.errors[e.field],
                                    error: Boolean(L.errors[e.field]),
                                    customMapping:
                                      null === b ||
                                      void 0 === b ||
                                      null ===
                                        (a = b.CUSTOM_INT_EDIT_MAPPING) ||
                                      void 0 === a ||
                                      null === (s = a[l]) ||
                                      void 0 === s
                                        ? void 0
                                        : s[e.field],
                                  }),
                                },
                                t
                              );
                            }),
                          }),
                        }),
                      }),
                ],
              })
            : U && 0 != U.length
            ? (0, A.jsx)(f.R, {})
            : (0, A.jsx)("div", {
                className: "!w-full !p-4",
                children: (0, A.jsx)(v.A, {
                  error: h.a.ERROR_CODES.PERMISSION_DENIED,
                }),
              });
        },
        C = (e) => {
          let {} = e;
          const { table_name: t, id: l } = (0, a.g)();
          return (0, A.jsx)("div", {
            className:
              "flex flex-col justify-start items-stretch w-full h-full",
            children: t && l && (0, A.jsx)(S, { tableName: t, id: l }),
          });
        };
    },
    26600: (e, t, l) => {
      l.d(t, { A: () => h });
      var a = l(58168),
        s = l(98587),
        r = l(65043),
        i = l(58387),
        n = l(68606),
        o = l(85865),
        c = l(34535),
        d = l(98206),
        u = l(87034),
        m = l(2563),
        x = l(70579);
      const f = ["className", "id"],
        p = (0, c.Ay)(o.A, {
          name: "MuiDialogTitle",
          slot: "Root",
          overridesResolver: (e, t) => t.root,
        })({ padding: "16px 24px", flex: "0 0 auto" }),
        h = r.forwardRef(function (e, t) {
          const l = (0, d.b)({ props: e, name: "MuiDialogTitle" }),
            { className: o, id: c } = l,
            h = (0, s.A)(l, f),
            j = l,
            N = ((e) => {
              const { classes: t } = e;
              return (0, n.A)({ root: ["root"] }, u.t, t);
            })(j),
            { titleId: v = c } = r.useContext(m.A);
          return (0,
          x.jsx)(p, (0, a.A)({ component: "h2", className: (0, i.A)(N.root, o), ownerState: j, ref: t, variant: "h6", id: null != c ? c : v }, h));
        });
    },
  },
]);
//# sourceMappingURL=6317.d7c9ec29.chunk.js.map
