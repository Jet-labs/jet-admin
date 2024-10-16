"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [9058],
  {
    11779: (e, n, a) => {
      a.d(n, { BZ: () => s, Tk: () => l, U6: () => t });
      const t =
          "\n## **Using queries variables**\n---------------------------\n\\\n**Referencing queries inside other queries:** Query values can be used in run-time inside another query by utilizing the syntax below:\n```sql\nselect * from city where city_id={{[pm_query_id:21][0].city_id]};\n```\n  - `{{}}` is used to utilize the variable\n  - `[]` is used to define the `pm_query_id` of desired query\n\n**Using app variables inside query** (Beta stage!)\n```sql\nselect * from city where city_id={{[pm_query_id:22][[pm_query_id:35][0].city_id].city_id}}\nor city_id={{[pm_app_variable_id:4].value}};\n```\n",
        s =
          '\n## **App variables**\n-------------\nApp variables are constants which contain JSON values and can be used for various purposes. There are two type of app variables, Internal and Global.\n\nInternal app variables are used for declaring constants utlized by Jet Admin while Global app variables can be used in Query objects.\n\nBelow are the some app variables\n- [x] CUSTOM_INT_VIEW_MAPPING : Used to render custom mapping for integer values of table column while viewing. Syntax of `CUSTOM_INT_VIEW_MAPPING` is:\n      \n    ```json\n    {\n        table_name: {\n            column_name: {\n                int_value1:label1,\n                int_value2:label2,\n                int_value3:label3,\n                ...\n            }\n        }\n    }\n    ```\n    For example\n    ```json\n    {\n        "restaurant_menu": {\n            "item_id": {\n                "1":"Tea",\n                "23":"Coffee",\n                "34":"Hot chocholate",\n                ...\n            }\n        }\n    }\n    ```\n- [x] CUSTOM_INT_EDIT_MAPPING : Used to render custom mapping for integer values of table column while editing a row. Syntax of `CUSTOM_INT_EDIT_MAPPING` is same as `CUSTOM_INT_VIEW_MAPPING`.\n- [x] APP_NAME : Used to declare custom application name:\n    ```json\n    {\n        "value":"Super food store admin"\n    }\n    ```\n',
        l =
          "\n##### **Cron Syntax Quick Reference**\n\n\n| Schedule | Cron Expression |\n|---|---|\n| Monday at 3 PM | `0 15 * * 1` |\n| Every 15 Minutes | `*/15 * * * *` |\n| First Day of Every Month at 5 AM | `0 5 1 * *` |\n\n\n##### **Fields**\n- **Minute**: `0-59`\n- **Hour**: `0-23`\n- **Day**: `1-31`\n- **Month**: `1-12`\n- **Day of Week**: `0-7` (0 & 7 are Sunday)\n\n##### **Special Characters**\n- **`*`**: Every\n- **`,`**: Multiple\n- **`-`**: Range\n- **`/`**: Increment\n";
    },
    28790: (e, n, a) => {
      a.d(n, { b: () => m });
      a(59537);
      var t = a(11981),
        s = a(65043),
        l = a(26240),
        r = a(68903),
        i = a(68577),
        o = a(19042),
        d = a(15795),
        c = a(39336),
        u = a(70579);
      const m = (e) => {
        let {
          key: n,
          readOnly: a,
          disabled: m,
          onError: p,
          value: h,
          handleChange: x,
          showRawInput: y,
          customStyle: _,
        } = e;
        const [f, b] = (0, s.useState)("24-hour-clock"),
          [j, v] = (0, s.useState)(!0),
          g = (0, l.A)();
        return (0, u.jsxs)(r.Ay, {
          container: !0,
          className: "!w-full",
          style: {
            borderColor: g.palette.divider,
            borderWidth: 1,
            borderRadius: 4,
          },
          children: [
            (0, u.jsx)(r.Ay, {
              item: !0,
              sx: 12,
              md: 12,
              lg: 12,
              className: "!p-3",
              children: (0, u.jsx)(i.A, {
                control: (0, u.jsx)(o.A, {
                  checked: j,
                  onChange: (e, n) => {
                    v(n);
                  },
                }),
                label: "Humanize values",
              }),
            }),
            (0, u.jsxs)(r.Ay, {
              item: !0,
              sx: 12,
              md: 12,
              lg: 12,
              className: "!p-3",
              children: [
                (0, u.jsx)("span", {
                  className: "!text-xs !font-light",
                  children: "Raw input (Cron job format)",
                }),
                (0, u.jsx)(d.A, {
                  fullWidth: !0,
                  size: "small",
                  variant: "outlined",
                  type: "text",
                  name: "cron-job-scheduler",
                  value: h,
                  className: "!mt-1",
                  onChange: (e) => x(e.target.value),
                }),
              ],
            }),
            (0, u.jsx)(c.A, { className: "!w-full !my-5", children: "Or" }),
            (0, u.jsx)(r.Ay, {
              item: !0,
              sx: 12,
              md: 12,
              lg: 12,
              className: "!p-3",
              children: (0, u.jsx)(
                t.l4,
                {
                  value: h,
                  setValue: (e) => {
                    console.log({ v: e, value: h }), x(e);
                  },
                  onError: p || null,
                  disabled: m,
                  readOnly: a,
                  humanizeLabels: j,
                  humanizeValue: j,
                  displayError: !1,
                  clearButton: !0,
                  shortcuts: !0,
                  allowEmpty: !0,
                  clockFormat: f || "24-hour-clock",
                  defaultPeriod: "day",
                  leadingZero: !0,
                  className: _ ? "my-project-cron" : void 0,
                  periodicityOnDoubleClick: !0,
                  mode: "multiple",
                  allowedDropdowns: [
                    "period",
                    "months",
                    "month-days",
                    "week-days",
                    "hours",
                    "minutes",
                  ],
                  allowedPeriods: [
                    "year",
                    "month",
                    "week",
                    "day",
                    "hour",
                    "minute",
                  ],
                  clearButtonProps: _ ? { type: "default" } : void 0,
                },
                n || "cron-job-scheduler"
              ),
            }),
          ],
        });
      };
    },
    15368: (e, n, a) => {
      a.d(n, { Y: () => d });
      a(65043);
      var t = a(98494),
        s = a(26240),
        l = a(55215),
        r = a(87895),
        i = a(6720),
        o = a(70579);
      const d = (e) => {
        let { tip: n } = e;
        const a = (0, s.A)(),
          { themeType: d } = (0, r.i7)();
        return (0, o.jsxs)("div", {
          style: {
            borderColor: a.palette.info.border,
            borderWidth: 1,
            borderRadius: 4,
            background: a.palette.background.info,
          },
          className: "!p-4",
          children: [
            (0, o.jsxs)("div", {
              className: "!flex !flex-row !justify-start !items-center  !mb-2",
              children: [
                (0, o.jsx)(i.LyK, {
                  className: "!text-lg",
                  style: { color: a.palette.warning.main },
                }),
                (0, o.jsx)("span", {
                  style: { color: a.palette.warning.main },
                  className: "!font-semibold !text-sm ml-1",
                  children: "Tip",
                }),
              ],
            }),
            (0, o.jsx)(t.o, {
              remarkPlugins: [l.A],
              options: {},
              className: "!text-sm !text-wrap  ".concat(
                "dark" === d
                  ? "dark:prose prose-pre:!bg-[#1b1b1b] prose-code:!text-[#91aeff] !text-slate-400 prose-strong:!text-slate-200  prose-th:!text-slate-50 prose-th:!text-start"
                  : "!prose prose-pre:!bg-[#e6e6e6] prose-code:!text-[".concat(
                      a.palette.primary.main,
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
    86994: (e, n, a) => {
      a.r(n), a.d(n, { default: () => w });
      var t = a(65043),
        s = (a(68685), a(26240)),
        l = a(68903),
        r = a(53193),
        i = a(15795),
        o = a(72221),
        d = a(32143),
        c = a(42518),
        u = a(63248),
        m = a(93747),
        p = a(47097),
        h = a(63516),
        x = a(35113),
        y = a(76639),
        _ = a(83359),
        f = a(66129),
        b = a(28790),
        j = a(15368),
        v = a(11779),
        g = a(88739),
        N = a(70579);
      const A = () => {
          const e = (0, s.A)(),
            n = (0, u.jE)(),
            {
              isLoading: a,
              data: A,
              error: w,
              refetch: S,
            } = (0, m.I)({
              queryKey: [g.a.REACT_QUERY_KEYS.QUERIES],
              queryFn: () => (0, x.Q2)(),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            }),
            T = (0, h.Wx)({
              initialValues: {
                pm_job_title: "Untitled",
                pm_query_id: "",
                pm_job_schedule: "",
              },
              validateOnMount: !1,
              validateOnChange: !1,
              validate: (e) => ({}),
              onSubmit: (e) => {
                console.log({ values: e });
              },
            }),
            {
              isPending: C,
              isSuccess: E,
              isError: I,
              error: q,
              mutate: k,
            } = (0, p.n)({
              mutationFn: (e) => (0, f.HP)({ data: e }),
              retry: !1,
              onSuccess: (e) => {
                (0, y.qq)(g.a.STRINGS.JOB_ADDITION_SUCCESS),
                  n.invalidateQueries([g.a.REACT_QUERY_KEYS.JOBS]);
              },
              onError: (e) => {
                (0, y.jx)(e);
              },
            }),
            M = (0, t.useCallback)(
              (e) => {
                null === T ||
                  void 0 === T ||
                  T.setFieldValue("pm_job_schedule", e);
              },
              [T]
            );
          return (0, N.jsxs)("div", {
            className: "w-full !h-[calc(100vh-50px)] overflow-y-scroll",
            children: [
              (0, N.jsx)("div", {
                className: "flex flex-col items-start justify-start p-3 px-6",
                style: { background: e.palette.background.paper },
                children: (0, N.jsx)("span", {
                  className: "text-lg font-bold text-start mt-1",
                  children: g.a.STRINGS.JOB_ADDITION_PAGE_TITLE,
                }),
              }),
              (0, N.jsxs)(l.Ay, {
                container: !0,
                className: "!h-full",
                children: [
                  (0, N.jsxs)(l.Ay, {
                    item: !0,
                    sx: 6,
                    md: 6,
                    lg: 6,
                    className: "w-full",
                    children: [
                      (0, N.jsxs)(r.A, {
                        fullWidth: !0,
                        size: "small",
                        className: "!mt-2 !px-3",
                        children: [
                          (0, N.jsx)("span", {
                            className: "text-xs font-light  !capitalize mb-1",
                            children: "Title",
                          }),
                          (0, N.jsx)(i.A, {
                            required: !0,
                            fullWidth: !0,
                            size: "small",
                            variant: "outlined",
                            type: "text",
                            name: "pm_job_title",
                            value: T.values.pm_job_title,
                            onChange: T.handleChange,
                            onBlur: T.handleBlur,
                          }),
                        ],
                      }),
                      (0, N.jsxs)(r.A, {
                        fullWidth: !0,
                        size: "small",
                        className: "!mt-2 !px-3",
                        children: [
                          (0, N.jsx)("span", {
                            className: "text-xs font-light  !capitalize mb-1",
                            children: "Select query",
                          }),
                          (0, N.jsx)(o.A, {
                            name: "pm_query_id",
                            value: T.values.pm_query_id,
                            onBlur: T.handleBlur,
                            onChange: T.handleChange,
                            required: !0,
                            size: "small",
                            fullWidth: !0,
                            children:
                              null === A || void 0 === A
                                ? void 0
                                : A.map(
                                    (e) => (
                                      console.log({ query: e }),
                                      (0, N.jsx)(d.A, {
                                        value: e.pm_query_id,
                                        children: (0, N.jsxs)("div", {
                                          className:
                                            "!flex flex-row justify-start items-center",
                                          children: [
                                            _.R[e.pm_query_type].icon,
                                            (0, N.jsx)("span", {
                                              className: "ml-2",
                                              children: e.pm_query_title,
                                            }),
                                          ],
                                        }),
                                      })
                                    )
                                  ),
                          }),
                        ],
                      }),
                      (0, N.jsx)("div", {
                        className:
                          "!flex flex-row justify-end items-center mt-10 w-100 px-3",
                        children: (0, N.jsx)(c.A, {
                          variant: "contained",
                          className: "!ml-3",
                          onClick: () => {
                            k(T.values);
                          },
                          children: g.a.STRINGS.ADD_BUTTON_TEXT,
                        }),
                      }),
                      (0, N.jsx)("div", {
                        className: "!mt-10 px-3 pb-3",
                        children: (0, N.jsx)(j.Y, { tip: v.Tk }),
                      }),
                    ],
                  }),
                  (0, N.jsxs)(l.Ay, {
                    item: !0,
                    sx: 6,
                    md: 6,
                    lg: 6,
                    className: "w-full !h-full !p-2",
                    children: [
                      (0, N.jsx)("span", {
                        className: "text-xs font-light  !capitalize mb-1",
                        children: "Schedule the job",
                      }),
                      (0, N.jsx)(b.b, {
                        value: T.values.pm_job_schedule,
                        handleChange: M,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        },
        w = () => (0, N.jsx)(A, {});
    },
  },
]);
//# sourceMappingURL=9058.44bb0268.chunk.js.map
