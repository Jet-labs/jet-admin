"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [4816],
  {
    11779: (e, n, t) => {
      t.d(n, { BZ: () => s, Tk: () => l, U6: () => a });
      const a =
          "\n## **Using queries variables**\n---------------------------\n\\\n**Referencing queries inside other queries:** Query values can be used in run-time inside another query by utilizing the syntax below:\n```sql\nselect * from city where city_id={{[pm_query_id:21][0].city_id]};\n```\n  - `{{}}` is used to utilize the variable\n  - `[]` is used to define the `pm_query_id` of desired query\n\n**Using app variables inside query** (Beta stage!)\n```sql\nselect * from city where city_id={{[pm_query_id:22][[pm_query_id:35][0].city_id].city_id}}\nor city_id={{[pm_app_variable_id:4].value}};\n```\n",
        s =
          '\n## **App variables**\n-------------\nApp variables are constants which contain JSON values and can be used for various purposes. There are two type of app variables, Internal and Global.\n\nInternal app variables are used for declaring constants utlized by Jet Admin while Global app variables can be used in Query objects.\n\nBelow are the some app variables\n- [x] CUSTOM_INT_VIEW_MAPPING : Used to render custom mapping for integer values of table column while viewing. Syntax of `CUSTOM_INT_VIEW_MAPPING` is:\n      \n    ```json\n    {\n        table_name: {\n            column_name: {\n                int_value1:label1,\n                int_value2:label2,\n                int_value3:label3,\n                ...\n            }\n        }\n    }\n    ```\n    For example\n    ```json\n    {\n        "restaurant_menu": {\n            "item_id": {\n                "1":"Tea",\n                "23":"Coffee",\n                "34":"Hot chocholate",\n                ...\n            }\n        }\n    }\n    ```\n- [x] CUSTOM_INT_EDIT_MAPPING : Used to render custom mapping for integer values of table column while editing a row. Syntax of `CUSTOM_INT_EDIT_MAPPING` is same as `CUSTOM_INT_VIEW_MAPPING`.\n- [x] APP_NAME : Used to declare custom application name:\n    ```json\n    {\n        "value":"Super food store admin"\n    }\n    ```\n',
        l =
          "\n##### **Cron Syntax Quick Reference**\n\n\n| Schedule | Cron Expression |\n|---|---|\n| Monday at 3 PM | `0 15 * * 1` |\n| Every 15 Minutes | `*/15 * * * *` |\n| First Day of Every Month at 5 AM | `0 5 1 * *` |\n\n\n##### **Fields**\n- **Minute**: `0-59`\n- **Hour**: `0-23`\n- **Day**: `1-31`\n- **Month**: `1-12`\n- **Day of Week**: `0-7` (0 & 7 are Sunday)\n\n##### **Special Characters**\n- **`*`**: Every\n- **`,`**: Multiple\n- **`-`**: Range\n- **`/`**: Increment\n";
    },
    15368: (e, n, t) => {
      t.d(n, { Y: () => d });
      t(65043);
      var a = t(98494),
        s = t(26240),
        l = t(55215),
        i = t(87895),
        r = t(6720),
        o = t(70579);
      const d = (e) => {
        let { tip: n } = e;
        const t = (0, s.A)(),
          { themeType: d } = (0, i.i7)();
        return (0, o.jsxs)("div", {
          style: {
            borderColor: t.palette.info.border,
            borderWidth: 1,
            borderRadius: 4,
            background: t.palette.background.info,
          },
          className: "!p-4",
          children: [
            (0, o.jsxs)("div", {
              className: "!flex !flex-row !justify-start !items-center  !mb-2",
              children: [
                (0, o.jsx)(r.LyK, {
                  className: "!text-lg",
                  style: { color: t.palette.warning.main },
                }),
                (0, o.jsx)("span", {
                  style: { color: t.palette.warning.main },
                  className: "!font-semibold !text-sm ml-1",
                  children: "Tip",
                }),
              ],
            }),
            (0, o.jsx)(a.o, {
              remarkPlugins: [l.A],
              options: {},
              className: "!text-sm !text-wrap  ".concat(
                "dark" === d
                  ? "dark:prose prose-pre:!bg-[#1b1b1b] prose-code:!text-[#91aeff] !text-slate-400 prose-strong:!text-slate-200  prose-th:!text-slate-50 prose-th:!text-start"
                  : "!prose prose-pre:!bg-[#e6e6e6] prose-code:!text-[".concat(
                      t.palette.primary.main,
                      "] prose-code:!text-[#0f2663] prose-th:text-start prose-th:!font-bold"
                    ),
                " "
              ),
              children: n,
            }),
          ],
        });
      };
    },
    54816: (e, n, t) => {
      t.r(n), t.d(n, { default: () => b });
      var a = t(65043),
        s = t(26240),
        l = t(53193),
        i = t(15795),
        r = t(42518),
        o = t(63248),
        d = t(47097),
        c = t(63516),
        u = (t(68685), t(35113)),
        p = t(11779),
        m = t(83359),
        h = t(76639),
        _ = t(61892),
        x = t(15368),
        y = t(88739),
        f = t(70579);
      const v = () => {
          const e = (0, s.A)(),
            n = (0, o.jE)(),
            t = (0, c.Wx)({
              initialValues: {
                pm_query_title: "Untitled",
                pm_query_description: "",
                pm_query_type: m.R.POSTGRE_QUERY.value,
                pm_query: {},
              },
              validateOnMount: !1,
              validateOnChange: !1,
              validate: (e) => ({}),
              onSubmit: (e) => {
                console.log({ values: e });
              },
            }),
            {
              isPending: v,
              isSuccess: b,
              isError: g,
              error: N,
              mutate: j,
            } = (0, d.n)({
              mutationFn: (e) => (0, u.OS)({ data: e }),
              retry: !1,
              onSuccess: (e) => {
                (0, h.qq)(y.a.STRINGS.QUERY_ADDITION_SUCCESS),
                  n.invalidateQueries([y.a.REACT_QUERY_KEYS.QUERIES]);
              },
              onError: (e) => {
                (0, h.jx)(e);
              },
            }),
            S = (0, a.useCallback)(
              (e) => {
                t && t.setFieldValue("pm_query", e);
              },
              [t]
            );
          return (0, f.jsxs)("div", {
            className: "w-full !h-[calc(100vh-100px)]",
            children: [
              (0, f.jsx)("div", {
                className: "flex flex-col items-start justify-start p-3 px-6",
                style: { background: e.palette.background.paper },
                children: (0, f.jsx)("span", {
                  className: "text-lg font-bold text-start mt-1",
                  children: y.a.STRINGS.QUERY_ADDITION_PAGE_TITLE,
                }),
              }),
              (0, f.jsxs)(_.HK, {
                direction: "horizontal",
                autoSaveId: "query-addition-form-panel-sizes",
                className: "!h-full",
                children: [
                  (0, f.jsxs)(_.wV, {
                    defaultSize: 40,
                    className: "w-full",
                    style: {
                      borderRightWidth: 1,
                      borderColor: e.palette.divider,
                    },
                    children: [
                      (0, f.jsxs)(l.A, {
                        fullWidth: !0,
                        size: "small",
                        className: "!mt-2 !px-3",
                        children: [
                          (0, f.jsx)("span", {
                            className: "text-xs font-light  !capitalize mb-1",
                            children: "Title",
                          }),
                          (0, f.jsx)(i.A, {
                            required: !0,
                            fullWidth: !0,
                            size: "small",
                            variant: "outlined",
                            type: "text",
                            name: "pm_query_title",
                            value: t.values.pm_query_title,
                            onChange: t.handleChange,
                            onBlur: t.handleBlur,
                          }),
                        ],
                      }),
                      (0, f.jsxs)(l.A, {
                        fullWidth: !0,
                        size: "small",
                        className: "!mt-2 !px-3",
                        children: [
                          (0, f.jsx)("span", {
                            className: "text-xs font-light  !capitalize mb-1",
                            children: "Description",
                          }),
                          (0, f.jsx)(i.A, {
                            required: !0,
                            fullWidth: !0,
                            size: "small",
                            variant: "outlined",
                            type: "text",
                            name: "pm_query_description",
                            value: t.values.pm_query_description,
                            onChange: t.handleChange,
                            onBlur: t.handleBlur,
                          }),
                        ],
                      }),
                      (0, f.jsx)("div", {
                        className:
                          "!flex flex-row justify-end items-center mt-10 w-full px-3",
                        children: (0, f.jsx)(r.A, {
                          variant: "contained",
                          className: "!ml-3",
                          onClick: () => {
                            j(t.values);
                          },
                          children: y.a.STRINGS.ADD_BUTTON_TEXT,
                        }),
                      }),
                      (0, f.jsx)("div", {
                        className: "!mt-10 px-3",
                        children: (0, f.jsx)(x.Y, { tip: p.U6 }),
                      }),
                    ],
                  }),
                  (0, f.jsx)(_.WM, { withHandle: !0 }),
                  (0, f.jsx)(_.wV, {
                    defaultSize: 60,
                    className: "w-full !h-full",
                    children: m.R[t.values.pm_query_type].component({
                      value: t.values.pm_query,
                      handleChange: S,
                    }),
                  }),
                ],
              }),
            ],
          });
        },
        b = () => (0, f.jsx)(v, {});
    },
  },
]);
//# sourceMappingURL=4816.cd225c23.chunk.js.map
