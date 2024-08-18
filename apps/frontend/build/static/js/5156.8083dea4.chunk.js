"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [5156],
  {
    11779: (e, t, n) => {
      n.d(t, { BZ: () => s, Tk: () => l, U6: () => a });
      const a =
          "\n## **Using queries variables**\n---------------------------\n\\\n**Referencing queries inside other queries:** Query values can be used in run-time inside another query by utilizing the syntax below:\n```sql\nselect * from city where city_id={{[pm_query_id:21][0].city_id]};\n```\n  - `{{}}` is used to utilize the variable\n  - `[]` is used to define the `pm_query_id` of desired query\n\n**Using app constants inside query** (Beta stage!)\n```sql\nselect * from city where city_id={{[pm_query_id:22][[pm_query_id:35][0].city_id].city_id}}\nor city_id={{[pm_app_constant_id:4].value}};\n```\n",
        s =
          '\n## **App constants**\n-------------\nApp constants are constants which contain JSON values and can be used for various purposes. There are two type of app constants, Internal and Global.\n\nInternal app constants are used for declaring constants utlized by Jet Admin while Global app constants can be used in Query objects.\n\nBelow are the some app constants\n- [x] CUSTOM_INT_VIEW_MAPPING : Used to render custom mapping for integer values of table column while viewing. Syntax of `CUSTOM_INT_VIEW_MAPPING` is:\n      \n    ```json\n    {\n        table_name: {\n            column_name: {\n                int_value1:label1,\n                int_value2:label2,\n                int_value3:label3,\n                ...\n            }\n        }\n    }\n    ```\n    For example\n    ```json\n    {\n        "restaurant_menu": {\n            "item_id": {\n                "1":"Tea",\n                "23":"Coffee",\n                "34":"Hot chocholate",\n                ...\n            }\n        }\n    }\n    ```\n- [x] CUSTOM_INT_EDIT_MAPPING : Used to render custom mapping for integer values of table column while editing a row. Syntax of `CUSTOM_INT_EDIT_MAPPING` is same as `CUSTOM_INT_VIEW_MAPPING`.\n- [x] APP_NAME : Used to declare custom application name:\n    ```json\n    {\n        "value":"Super food store admin"\n    }\n    ```\n',
        l =
          "\n##### **Cron Syntax Quick Reference**\n\n\n| Schedule | Cron Expression |\n|---|---|\n| Monday at 3 PM | `0 15 * * 1` |\n| Every 15 Minutes | `*/15 * * * *` |\n| First Day of Every Month at 5 AM | `0 5 1 * *` |\n\n\n##### **Fields**\n- **Minute**: `0-59`\n- **Hour**: `0-23`\n- **Day**: `1-31`\n- **Month**: `1-12`\n- **Day of Week**: `0-7` (0 & 7 are Sunday)\n\n##### **Special Characters**\n- **`*`**: Every\n- **`,`**: Multiple\n- **`-`**: Range\n- **`/`**: Increment\n";
    },
    10492: (e, t, n) => {
      n.d(t, { n: () => p });
      var a = n(26240),
        s = n(68903),
        l = n(15795),
        r = n(67254),
        o = n(68577),
        i = n(51962),
        c = (n(59537), n(13733)),
        d = n(70579);
      const p = (e) => {
        var t;
        let { appConstantForm: n } = e;
        const p = (0, a.A)();
        return (0, d.jsxs)(s.Ay, {
          container: !0,
          className: "!w-full",
          style: {},
          children: [
            (0, d.jsxs)(s.Ay, {
              item: !0,
              sx: 12,
              md: 12,
              lg: 12,
              className: "!p-3",
              children: [
                (0, d.jsx)("span", {
                  className: "!text-xs !font-light",
                  children: "Title",
                }),
                (0, d.jsx)(l.A, {
                  required: !0,
                  fullWidth: !0,
                  size: "small",
                  variant: "outlined",
                  type: "text",
                  name: "pm_app_constant_title",
                  value: n.values.pm_app_constant_title,
                  onChange: n.handleChange,
                  onBlur: n.handleBlur,
                }),
              ],
            }),
            (0, d.jsxs)(s.Ay, {
              item: !0,
              sx: 12,
              md: 12,
              lg: 12,
              className: "!px-3",
              children: [
                " ",
                (0, d.jsx)(r.A, {
                  sx: {
                    background: p.palette.background.info,
                    color: p.palette.info.main,
                    "& .MuiAlert-message": { marginTop: 0.2 },
                  },
                  severity: "info",
                  className: "!py-0 !text-xs",
                  children: "Internal app constants should not be deleted",
                }),
              ],
            }),
            (0, d.jsx)(s.Ay, {
              item: !0,
              sx: 12,
              md: 12,
              lg: 12,
              className: "!px-3",
              children: (0, d.jsx)(o.A, {
                control: (0, d.jsx)(i.A, {
                  checked: n.values.is_internal,
                  onChange: (e) => {
                    null === n ||
                      void 0 === n ||
                      n.setFieldValue("is_internal", e.target.checked);
                  },
                }),
                label: "Internal",
              }),
            }),
            (0, d.jsx)(s.Ay, {
              item: !0,
              sx: 12,
              md: 12,
              lg: 12,
              className: "!p-3",
              children: (0, d.jsx)(c.B, {
                code:
                  null !== n &&
                  void 0 !== n &&
                  null !== (t = n.values) &&
                  void 0 !== t &&
                  t.pm_app_constant_value
                    ? "object" === typeof n.values.pm_app_constant_value
                      ? JSON.stringify(n.values.pm_app_constant_value, null, 2)
                      : n.values.pm_app_constant_value
                    : JSON.stringify({}),
                setCode: (e) => {
                  null === n ||
                    void 0 === n ||
                    n.setFieldValue(
                      "pm_app_constant_value",
                      "string" === typeof e ? JSON.parse(e) : e
                    );
                },
                height: "400px",
              }),
            }),
          ],
        });
      };
    },
    13733: (e, t, n) => {
      n.d(t, { B: () => x });
      var a = n(65043),
        s = n(72890),
        l = n(57643),
        r = n(95043),
        o = n(67680),
        i = n(15346),
        c = n(81747),
        d = n(26240),
        p = n(87895),
        u = n(25196),
        m = n(70579);
      const _ = {
          javascript: (0, l.javascript)(),
          json: (0, r.json)(),
          sql: (0, o.sql)(),
          pgsql: (0, u.rI)("pgsql"),
        },
        x = (e) => {
          let {
            readOnly: t,
            disabled: n,
            code: l,
            setCode: r,
            language: o = "json",
            height: u = "200px",
            outlined: x = !0,
            transparent: h = !1,
            rounded: A = !0,
          } = e;
          const T = (0, d.A)(),
            N = (0, a.useRef)(),
            { themeType: f } = (0, p.i7)();
          return (0, m.jsx)(s.Ay, {
            readOnly: t || n,
            ref: N,
            value: l,
            height: u,
            width: "100%",
            maxWidth: "1000px",
            extensions: [_[o]],
            onChange: r,
            theme: "dark" == f ? c.Ts : i.al,
            basicSetup: { closeBrackets: !0, indentOnInput: !0 },
            style: {
              borderWidth: x ? 1 : 0,
              borderColor: T.palette.divider,
              borderRadius: x ? 4 : 0,
            },
            className: A ? "codemirror-editor-rounded" : "",
            indentWithTab: !0,
          });
        };
    },
    15368: (e, t, n) => {
      n.d(t, { Y: () => c });
      n(65043);
      var a = n(98494),
        s = n(26240),
        l = n(55215),
        r = n(87895),
        o = n(6720),
        i = n(70579);
      const c = (e) => {
        let { tip: t } = e;
        const n = (0, s.A)(),
          { themeType: c } = (0, r.i7)();
        return (0, i.jsxs)("div", {
          style: {
            borderColor: n.palette.info.border,
            borderWidth: 1,
            borderRadius: 4,
            background: n.palette.background.info,
          },
          className: "!p-4",
          children: [
            (0, i.jsxs)("div", {
              className: "!flex !flex-row !justify-start !items-center  !mb-2",
              children: [
                (0, i.jsx)(o.LyK, {
                  className: "!text-lg",
                  style: { color: n.palette.warning.main },
                }),
                (0, i.jsx)("span", {
                  style: { color: n.palette.warning.main },
                  className: "!font-semibold !text-sm ml-1",
                  children: "Tip",
                }),
              ],
            }),
            (0, i.jsx)(a.o, {
              remarkPlugins: [l.A],
              options: {},
              className: "!text-sm !text-wrap  ".concat(
                "dark" === c
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
    55930: (e, t, n) => {
      n.r(t), n.d(t, { default: () => S });
      var a = n(73216),
        s = n(26240),
        l = n(68903),
        r = n(42518),
        o = n(63248),
        i = n(93747),
        c = n(47097),
        d = n(63516),
        p = n(65043),
        u = (n(68685), n(73062)),
        m = n(76639),
        _ = n(10492),
        x = n(17160),
        h = n(56249),
        A = n(45394),
        T = n(88739),
        N = n(70579);
      const f = (e) => {
        let { pmAppConstantID: t } = e;
        const { pmUser: n } = (0, x.hD)(),
          s = (0, o.jE)(),
          [l, i] = (0, p.useState)(!1),
          d = (0, a.Zp)(),
          _ = (0, p.useMemo)(
            () => !!n && n.extractAppConstantDeletionAuthorization(t),
            [n, t]
          ),
          {
            isPending: f,
            isSuccess: y,
            isError: v,
            error: g,
            mutate: S,
          } = (0, c.n)({
            mutationFn: (e) => {
              let { pmAppConstantID: t } = e;
              return (0, u.Jx)({ pmAppConstantID: t });
            },
            retry: !1,
            onSuccess: () => {
              (0, m.qq)(T.a.STRINGS.APP_CONSTANT_DELETED_SUCCESS),
                s.invalidateQueries([T.a.REACT_QUERY_KEYS.APP_CONSTANTS]),
                d(T.a.ROUTES.ALL_APP_CONSTANTS.path()),
                i(!1);
            },
            onError: (e) => {
              (0, m.jx)(e);
            },
          });
        return (
          _ &&
          (0, N.jsxs)(N.Fragment, {
            children: [
              (0, N.jsx)(r.A, {
                onClick: () => {
                  i(!0);
                },
                startIcon: (0, N.jsx)(A.tW_, { className: "!text-sm" }),
                size: "medium",
                variant: "outlined",
                className: "!ml-2",
                color: "error",
                children: T.a.STRINGS.DELETE_BUTTON_TEXT,
              }),
              (0, N.jsx)(h.K, {
                open: l,
                onAccepted: () => {
                  S({ pmAppConstantID: t });
                },
                onDecline: () => {
                  i(!1);
                },
                title: T.a.STRINGS.APP_CONSTANT_DELETION_CONFIRMATION_TITLE,
                message: ""
                  .concat(
                    T.a.STRINGS.APP_CONSTANT_DELETION_CONFIRMATION_BODY,
                    " - "
                  )
                  .concat(t),
              }),
            ],
          })
        );
      };
      var y = n(15368),
        v = n(11779);
      const g = (e) => {
          let { id: t } = e;
          const n = (0, s.A)(),
            a = (0, o.jE)(),
            {
              isLoading: x,
              data: h,
              error: A,
            } = (0, i.I)({
              queryKey: [T.a.REACT_QUERY_KEYS.APP_CONSTANTS, t],
              queryFn: () => (0, u.yL)({ pmAppConstantID: t }),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            });
          console.log({ appConstantData: h });
          const g = (0, d.Wx)({
            initialValues: {
              pm_app_constant_title: "Untitled",
              pm_app_constant_value: JSON.stringify({}),
              is_internal: !1,
            },
            validateOnMount: !1,
            validateOnChange: !1,
            validate: (e) => ({}),
            onSubmit: (e) => {
              console.log({ values: e });
            },
          });
          (0, p.useEffect)(() => {
            g &&
              h &&
              (g.setFieldValue("pm_app_constant_id", h.pm_app_constant_id),
              g.setFieldValue("pm_app_constant_title", h.pm_app_constant_title),
              g.setFieldValue("is_internal", h.is_internal),
              g.setFieldValue(
                "pm_app_constant_value",
                h.pm_app_constant_value
              ));
          }, [h]);
          const {
            isPending: S,
            isSuccess: j,
            isError: C,
            error: b,
            mutate: E,
          } = (0, c.n)({
            mutationFn: (e) => (0, u.P$)({ data: e }),
            retry: !1,
            onSuccess: (e) => {
              (0, m.qq)(T.a.STRINGS.APP_CONSTANT_UPDATED_SUCCESS),
                a.invalidateQueries([T.a.REACT_QUERY_KEYS.APP_CONSTANTS]);
            },
            onError: (e) => {
              (0, m.jx)(e);
            },
          });
          return (0, N.jsxs)("div", {
            className: "w-full !h-[calc(100vh-50px)] overflow-y-scroll",
            children: [
              (0, N.jsxs)("div", {
                className:
                  "flex flex-col items-start justify-start p-3 px-6 w-full",
                style: {
                  background: n.palette.background.paper,
                  borderBottomWidth: 1,
                  borderColor: n.palette.divider,
                },
                children: [
                  (0, N.jsx)("span", {
                    className: "text-lg font-bold text-start",
                    children: T.a.STRINGS.APP_CONSTANT_UPDATE_PAGE_TITLE,
                  }),
                  (0, N.jsx)("span", {
                    className: "text-xs font-medium text-start mt-1",
                    children: "AppConstant id : ".concat(t),
                  }),
                ],
              }),
              (0, N.jsxs)(l.Ay, {
                container: !0,
                children: [
                  (0, N.jsxs)(l.Ay, {
                    item: !0,
                    xl: 6,
                    lg: 6,
                    md: 12,
                    sm: 12,
                    xs: 12,
                    children: [
                      (0, N.jsx)(_.n, { appConstantForm: g }),
                      (0, N.jsxs)("div", {
                        className:
                          "!flex flex-row justify-end items-center mt-10 w-full px-3",
                        children: [
                          (0, N.jsx)(f, { pmAppConstantID: t }),
                          (0, N.jsx)(r.A, {
                            variant: "contained",
                            className: "!ml-3",
                            onClick: () => {
                              console.log(g.values), E(g.values);
                            },
                            children: T.a.STRINGS.UPDATE_BUTTON_TEXT,
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, N.jsx)(l.Ay, {
                    item: !0,
                    xl: 6,
                    lg: 6,
                    md: 0,
                    sm: 0,
                    xs: 0,
                    className: "!p-3",
                    children: (0, N.jsx)(y.Y, { tip: v.BZ }),
                  }),
                ],
              }),
            ],
          });
        },
        S = (e) => {
          let {} = e;
          const { id: t } = (0, a.g)();
          return (0, N.jsx)("div", {
            className:
              "flex flex-col justify-start items-stretch w-full h-full",
            children: t && (0, N.jsx)(g, { id: t }),
          });
        };
    },
    26600: (e, t, n) => {
      n.d(t, { A: () => h });
      var a = n(58168),
        s = n(98587),
        l = n(65043),
        r = n(58387),
        o = n(68606),
        i = n(85865),
        c = n(34535),
        d = n(98206),
        p = n(87034),
        u = n(2563),
        m = n(70579);
      const _ = ["className", "id"],
        x = (0, c.Ay)(i.A, {
          name: "MuiDialogTitle",
          slot: "Root",
          overridesResolver: (e, t) => t.root,
        })({ padding: "16px 24px", flex: "0 0 auto" }),
        h = l.forwardRef(function (e, t) {
          const n = (0, d.b)({ props: e, name: "MuiDialogTitle" }),
            { className: i, id: c } = n,
            h = (0, s.A)(n, _),
            A = n,
            T = ((e) => {
              const { classes: t } = e;
              return (0, o.A)({ root: ["root"] }, p.t, t);
            })(A),
            { titleId: N = c } = l.useContext(u.A);
          return (0,
          m.jsx)(x, (0, a.A)({ component: "h2", className: (0, r.A)(T.root, i), ownerState: A, ref: t, variant: "h6", id: null != c ? c : N }, h));
        });
    },
    52900: (e, t, n) => {
      n.d(t, { A: () => l });
      var a = n(64775),
        s = n(45527);
      function l(e) {
        let { props: t, name: n, defaultTheme: l, themeId: r } = e,
          o = (0, s.A)(l);
        r && (o = o[r] || o);
        return (0, a.A)({ theme: o, name: n, props: t });
      }
    },
  },
]);
//# sourceMappingURL=5156.8083dea4.chunk.js.map
