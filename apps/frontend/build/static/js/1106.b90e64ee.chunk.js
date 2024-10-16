"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [1106],
  {
    11779: (e, t, n) => {
      n.d(t, { BZ: () => a, Tk: () => r, U6: () => s });
      const s =
          "\n## **Using queries variables**\n---------------------------\n\\\n**Referencing queries inside other queries:** Query values can be used in run-time inside another query by utilizing the syntax below:\n```sql\nselect * from city where city_id={{[pm_query_id:21][0].city_id]};\n```\n  - `{{}}` is used to utilize the variable\n  - `[]` is used to define the `pm_query_id` of desired query\n\n**Using app variables inside query** (Beta stage!)\n```sql\nselect * from city where city_id={{[pm_query_id:22][[pm_query_id:35][0].city_id].city_id}}\nor city_id={{[pm_app_variable_id:4].value}};\n```\n",
        a =
          '\n## **App variables**\n-------------\nApp variables are constants which contain JSON values and can be used for various purposes. There are two type of app variables, Internal and Global.\n\nInternal app variables are used for declaring constants utlized by Jet Admin while Global app variables can be used in Query objects.\n\nBelow are the some app variables\n- [x] CUSTOM_INT_VIEW_MAPPING : Used to render custom mapping for integer values of table column while viewing. Syntax of `CUSTOM_INT_VIEW_MAPPING` is:\n      \n    ```json\n    {\n        table_name: {\n            column_name: {\n                int_value1:label1,\n                int_value2:label2,\n                int_value3:label3,\n                ...\n            }\n        }\n    }\n    ```\n    For example\n    ```json\n    {\n        "restaurant_menu": {\n            "item_id": {\n                "1":"Tea",\n                "23":"Coffee",\n                "34":"Hot chocholate",\n                ...\n            }\n        }\n    }\n    ```\n- [x] CUSTOM_INT_EDIT_MAPPING : Used to render custom mapping for integer values of table column while editing a row. Syntax of `CUSTOM_INT_EDIT_MAPPING` is same as `CUSTOM_INT_VIEW_MAPPING`.\n- [x] APP_NAME : Used to declare custom application name:\n    ```json\n    {\n        "value":"Super food store admin"\n    }\n    ```\n',
        r =
          "\n##### **Cron Syntax Quick Reference**\n\n\n| Schedule | Cron Expression |\n|---|---|\n| Monday at 3 PM | `0 15 * * 1` |\n| Every 15 Minutes | `*/15 * * * *` |\n| First Day of Every Month at 5 AM | `0 5 1 * *` |\n\n\n##### **Fields**\n- **Minute**: `0-59`\n- **Hour**: `0-23`\n- **Day**: `1-31`\n- **Month**: `1-12`\n- **Day of Week**: `0-7` (0 & 7 are Sunday)\n\n##### **Special Characters**\n- **`*`**: Every\n- **`,`**: Multiple\n- **`-`**: Range\n- **`/`**: Increment\n";
    },
    15368: (e, t, n) => {
      n.d(t, { Y: () => u });
      n(65043);
      var s = n(98494),
        a = n(26240),
        r = n(55215),
        i = n(87895),
        l = n(6720),
        o = n(70579);
      const u = (e) => {
        let { tip: t } = e;
        const n = (0, a.A)(),
          { themeType: u } = (0, i.i7)();
        return (0, o.jsxs)("div", {
          style: {
            borderColor: n.palette.info.border,
            borderWidth: 1,
            borderRadius: 4,
            background: n.palette.background.info,
          },
          className: "!p-4",
          children: [
            (0, o.jsxs)("div", {
              className: "!flex !flex-row !justify-start !items-center  !mb-2",
              children: [
                (0, o.jsx)(l.LyK, {
                  className: "!text-lg",
                  style: { color: n.palette.warning.main },
                }),
                (0, o.jsx)("span", {
                  style: { color: n.palette.warning.main },
                  className: "!font-semibold !text-sm ml-1",
                  children: "Tip",
                }),
              ],
            }),
            (0, o.jsx)(s.o, {
              remarkPlugins: [r.A],
              options: {},
              className: "!text-sm !text-wrap  ".concat(
                "dark" === u
                  ? "dark:prose prose-pre:!bg-[#1b1b1b] prose-code:!text-[#91aeff] !text-slate-400 prose-strong:!text-slate-200  prose-th:!text-slate-50 prose-th:!text-start"
                  : "!prose prose-pre:!bg-[#e6e6e6] prose-code:!text-[".concat(
                      n.palette.primary.main,
                      "] prose-code:!text-[#0f2663] prose-th:text-start prose-th:!font-bold"
                    ),
                " "
              ),
              children: t,
            }),
          ],
        });
      };
    },
    91219: (e, t, n) => {
      n.r(t), n.d(t, { default: () => g });
      var s = n(65043),
        a = (n(68685), n(73216)),
        r = n(26240),
        i = n(53193),
        l = n(15795),
        o = n(42518),
        u = n(63248),
        c = n(93747),
        d = n(47097),
        m = n(63516),
        p = n(35113),
        _ = n(88739),
        y = n(83359),
        x = n(76639),
        h = n(17160),
        E = n(56249),
        T = n(45394),
        I = n(70579);
      const f = (e) => {
        let { pmQueryID: t } = e;
        const { pmUser: n } = (0, h.hD)(),
          r = (0, u.jE)(),
          [i, l] = (0, s.useState)(!1),
          c = (0, a.Zp)(),
          m = (0, s.useMemo)(
            () => !!n && n.extractQueryDeleteAuthorization(t),
            [n, t]
          ),
          {
            isPending: y,
            isSuccess: f,
            isError: S,
            error: N,
            mutate: v,
          } = (0, d.n)({
            mutationFn: (e) => {
              let { pmQueryID: t } = e;
              return (0, p.OF)({ pmQueryID: t });
            },
            retry: !1,
            onSuccess: () => {
              (0, x.qq)(_.a.STRINGS.QUERY_DELETED_SUCCESS),
                r.invalidateQueries([_.a.REACT_QUERY_KEYS.QUERIES]),
                c(_.a.ROUTES.ALL_QUERIES.path()),
                l(!1);
            },
            onError: (e) => {
              (0, x.jx)(e);
            },
          });
        return (
          m &&
          (0, I.jsxs)(I.Fragment, {
            children: [
              (0, I.jsx)(o.A, {
                onClick: () => {
                  l(!0);
                },
                startIcon: (0, I.jsx)(T.tW_, { className: "!text-sm" }),
                size: "medium",
                variant: "outlined",
                className: "!ml-2",
                color: "error",
                children: _.a.STRINGS.DELETE_BUTTON_TEXT,
              }),
              (0, I.jsx)(E.K, {
                open: i,
                onAccepted: () => {
                  v({ pmQueryID: t });
                },
                onDecline: () => {
                  l(!1);
                },
                title: _.a.STRINGS.QUERY_DELETION_CONFIRMATION_TITLE,
                message: ""
                  .concat(_.a.STRINGS.QUERY_DELETION_CONFIRMATION_BODY, " - ")
                  .concat(t),
              }),
            ],
          })
        );
      };
      var S = n(23156);
      const N = (e) => {
        let { pmQueryID: t } = e;
        const { pmUser: n } = (0, h.hD)(),
          a = (0, u.jE)(),
          [r, i] = (0, s.useState)(!1),
          l = (0, s.useMemo)(() => n && n.extractQueryAddAuthorization, [n]),
          {
            isPending: c,
            isSuccess: m,
            isError: y,
            error: T,
            mutate: f,
          } = (0, d.n)({
            mutationFn: (e) => {
              let { pmQueryID: t } = e;
              return (0, p.m9)({ pmQueryID: t });
            },
            retry: !1,
            onSuccess: () => {
              (0, x.qq)(_.a.STRINGS.QUERY_ADDITION_SUCCESS),
                a.invalidateQueries([_.a.REACT_QUERY_KEYS.QUERIES]);
            },
            onError: (e) => {
              (0, x.jx)(e);
            },
          });
        return (
          l &&
          (0, I.jsxs)(I.Fragment, {
            children: [
              (0, I.jsx)(o.A, {
                onClick: () => {
                  i(!0);
                },
                startIcon: (0, I.jsx)(S.paH, { className: "!text-sm" }),
                size: "medium",
                variant: "outlined",
                className: "!ml-2",
                color: "primary",
                children: _.a.STRINGS.DUPLICATE_BUTTON_TEXT,
              }),
              (0, I.jsx)(E.K, {
                open: r,
                onAccepted: () => {
                  f({ pmQueryID: t });
                },
                onDecline: () => {
                  i(!1);
                },
                title: _.a.STRINGS.QUERY_DUPLICATE_CONFIRMATION_TITLE,
                message: ""
                  .concat(_.a.STRINGS.QUERY_DUPLICATE_CONFIRMATION_BODY, " - ")
                  .concat(t),
              }),
            ],
          })
        );
      };
      var v = n(15368),
        j = n(11779),
        A = n(61892);
      const R = (e) => {
          let { id: t } = e;
          const n = (0, r.A)(),
            a = (0, u.jE)(),
            {
              isLoading: h,
              data: E,
              error: T,
            } = (0, c.I)({
              queryKey: [_.a.REACT_QUERY_KEYS.QUERIES, t],
              queryFn: () => (0, p.Fd)({ pmQueryID: t }),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            }),
            S = (0, m.Wx)({
              initialValues: {
                pm_query_title: "Untitled",
                pm_query_description: "",
                pm_query_type: y.R.POSTGRE_QUERY.value,
                pm_query: null,
                pm_query_id: parseInt(t),
              },
              validateOnMount: !1,
              validateOnChange: !1,
              validate: (e) => ({}),
              onSubmit: (e) => {},
            });
          (0, s.useEffect)(() => {
            S &&
              E &&
              (S.setFieldValue("pm_query_id", E.pm_query_id),
              S.setFieldValue("pm_query_title", E.pm_query_title),
              S.setFieldValue("pm_query_description", E.pm_query_description),
              S.setFieldValue("pm_query_type", E.pm_query_type),
              S.setFieldValue("pm_query", E.pm_query));
          }, [E]);
          const {
              isPending: R,
              isSuccess: g,
              isError: q,
              error: U,
              mutate: b,
            } = (0, d.n)({
              mutationFn: (e) => (0, p.G4)({ data: e }),
              retry: !1,
              onSuccess: (e) => {
                (0, x.qq)(_.a.STRINGS.QUERY_UPDATED_SUCCESS),
                  a.invalidateQueries([_.a.REACT_QUERY_KEYS.QUERIES]);
              },
              onError: (e) => {
                (0, x.jx)(e);
              },
            }),
            C = (0, s.useCallback)(
              (e) => {
                S && S.setFieldValue("pm_query", e);
              },
              [S]
            );
          return (0, I.jsxs)("div", {
            className: "w-full !h-[calc(100vh-100px)]",
            children: [
              (0, I.jsxs)("div", {
                className:
                  "flex flex-row justify-start items-center w-full px-3",
                style: {
                  background: n.palette.background.paper,
                  borderBottomWidth: 1,
                  borderColor: n.palette.divider,
                },
                children: [
                  y.R[S.values.pm_query_type].iconLarge,
                  (0, I.jsxs)("div", {
                    className:
                      "flex flex-col items-start justify-start p-3 px-4",
                    children: [
                      (0, I.jsx)("span", {
                        className: "text-lg font-bold text-start",
                        children: _.a.STRINGS.QUERY_UPDATE_PAGE_TITLE,
                      }),
                      (0, I.jsx)("span", {
                        className: "text-xs font-medium text-start mt-1",
                        children: "Query id : ".concat(t),
                      }),
                    ],
                  }),
                ],
              }),
              (0, I.jsxs)(A.HK, {
                direction: "horizontal",
                autoSaveId: "query-update-form-panel-sizes",
                className: "!h-full",
                children: [
                  (0, I.jsxs)(A.wV, {
                    defaultSize: 40,
                    className: "w-full",
                    style: {
                      borderRightWidth: 1,
                      borderColor: n.palette.divider,
                    },
                    children: [
                      (0, I.jsxs)(i.A, {
                        fullWidth: !0,
                        size: "small",
                        className: "!mt-2 !px-3",
                        children: [
                          (0, I.jsx)("span", {
                            className: "text-xs font-light  !capitalize mb-1",
                            children: "Title",
                          }),
                          (0, I.jsx)(l.A, {
                            required: !0,
                            fullWidth: !0,
                            size: "small",
                            variant: "outlined",
                            type: "text",
                            name: "pm_query_title",
                            value: S.values.pm_query_title,
                            onChange: S.handleChange,
                            onBlur: S.handleBlur,
                          }),
                        ],
                      }),
                      (0, I.jsxs)(i.A, {
                        fullWidth: !0,
                        size: "small",
                        className: "!mt-2 !px-3",
                        children: [
                          (0, I.jsx)("span", {
                            className: "text-xs font-light  !capitalize mb-1",
                            children: "Description",
                          }),
                          (0, I.jsx)(l.A, {
                            required: !0,
                            fullWidth: !0,
                            size: "small",
                            variant: "outlined",
                            type: "text",
                            name: "pm_query_description",
                            value: S.values.pm_query_description,
                            onChange: S.handleChange,
                            onBlur: S.handleBlur,
                          }),
                        ],
                      }),
                      (0, I.jsxs)("div", {
                        className:
                          "!flex flex-row justify-end items-center mt-10 w-100 px-3",
                        children: [
                          (0, I.jsx)(o.A, {
                            variant: "contained",
                            className: "!ml-3",
                            onClick: () => {
                              b(S.values);
                            },
                            children: _.a.STRINGS.UPDATE_BUTTON_TEXT,
                          }),
                          (0, I.jsx)(f, { pmQueryID: t }),
                          (0, I.jsx)(N, { pmQueryID: t }),
                        ],
                      }),
                      (0, I.jsx)("div", {
                        className: "!mt-10 px-3",
                        children: (0, I.jsx)(v.Y, { tip: j.U6 }),
                      }),
                    ],
                  }),
                  (0, I.jsx)(A.WM, { withHandle: !0 }),
                  (0, I.jsx)(A.wV, {
                    defaultSize: 40,
                    className: "w-full !h-full",
                    children: y.R[S.values.pm_query_type].component({
                      pmQueryID: t,
                      value: S.values.pm_query,
                      handleChange: C,
                    }),
                  }),
                ],
              }),
            ],
          });
        },
        g = () => {
          const { id: e } = (0, a.g)();
          return (0, I.jsx)(R, { id: e });
        };
    },
    26600: (e, t, n) => {
      n.d(t, { A: () => x });
      var s = n(58168),
        a = n(98587),
        r = n(65043),
        i = n(58387),
        l = n(68606),
        o = n(85865),
        u = n(34535),
        c = n(98206),
        d = n(87034),
        m = n(2563),
        p = n(70579);
      const _ = ["className", "id"],
        y = (0, u.Ay)(o.A, {
          name: "MuiDialogTitle",
          slot: "Root",
          overridesResolver: (e, t) => t.root,
        })({ padding: "16px 24px", flex: "0 0 auto" }),
        x = r.forwardRef(function (e, t) {
          const n = (0, c.b)({ props: e, name: "MuiDialogTitle" }),
            { className: o, id: u } = n,
            x = (0, a.A)(n, _),
            h = n,
            E = ((e) => {
              const { classes: t } = e;
              return (0, l.A)({ root: ["root"] }, d.t, t);
            })(h),
            { titleId: T = u } = r.useContext(m.A);
          return (0,
          p.jsx)(y, (0, s.A)({ component: "h2", className: (0, i.A)(E.root, o), ownerState: h, ref: t, variant: "h6", id: null != u ? u : T }, x));
        });
    },
  },
]);
//# sourceMappingURL=1106.b90e64ee.chunk.js.map
