"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [5268],
  {
    27722: (e, t, a) => {
      a.d(t, {
        $z: () => o,
        Ae: () => p,
        S6: () => l,
        UZ: () => m,
        bc: () => i,
        lE: () => x,
        oJ: () => u,
        wP: () => d,
        x9: () => c,
        xH: () => r,
      });
      var s = a(88739),
        n = a(33211);
      const r = async () => {
          try {
            const e = await n.A.get(s.a.APIS.TABLE.getAllTables());
            if (e.data && 1 == e.data.success) return e.data.tables;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (e) {
            throw e;
          }
        },
        l = async (e) => {
          let { tableName: t } = e;
          try {
            const e = await n.A.get(
              s.a.APIS.TABLE.getTableColumns({ tableName: t })
            );
            if (e.data && 1 == e.data.success)
              return Array.from(e.data.columns);
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (a) {
            throw a;
          }
        },
        i = async (e) => {
          let { tableName: t } = e;
          try {
            const e = await n.A.get(
              s.a.APIS.TABLE.getAuthorizedColumnsForAdd({ tableName: t })
            );
            if (e.data && 1 == e.data.success)
              return Array.from(e.data.columns);
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (a) {
            throw a;
          }
        },
        o = async (e) => {
          let {
            tableName: t,
            page: a = 1,
            pageSize: r = 20,
            filterQuery: l,
            sortModel: i,
          } = e;
          try {
            const e = await n.A.get(
              s.a.APIS.TABLE.getTableRows({
                tableName: t,
                page: a,
                pageSize: r,
                filterQuery: l,
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
          let { tableName: t, filterQuery: a } = e;
          try {
            const e = await n.A.get(
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
            const e = await n.A.get(
              s.a.APIS.TABLE.getTableRowByID({ tableName: t, id: a })
            );
            if (e.data && 1 == e.data.success) return e.data.row;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (r) {
            throw r;
          }
        },
        u = async (e) => {
          let { tableName: t, id: a, data: r } = e;
          try {
            const e = await n.A.put(
              s.a.APIS.TABLE.updateTableRowByID({ tableName: t, id: a }),
              r
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (l) {
            throw l;
          }
        },
        m = async (e) => {
          let { tableName: t, data: a } = e;
          try {
            const e = await n.A.post(
              s.a.APIS.TABLE.addTableRowByID({ tableName: t }),
              a
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (r) {
            throw r;
          }
        },
        p = async (e) => {
          let { tableName: t, id: a } = e;
          try {
            const e = await n.A.delete(
              s.a.APIS.TABLE.deleteTableRowByID({ tableName: t, id: a })
            );
            if (e.data && 1 == e.data.success) return !0;
            throw e.data.error ? e.data.error : s.a.ERROR_CODES.SERVER_ERROR;
          } catch (r) {
            throw r;
          }
        },
        x = async (e) => {
          let { tableName: t, ids: a } = e;
          try {
            const e = await n.A.post(
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
    11779: (e, t, a) => {
      a.d(t, { BZ: () => n, Tk: () => r, U6: () => s });
      const s =
          "\n## **Using queries variables**\n---------------------------\n\\\n**Referencing queries inside other queries:** Query values can be used in run-time inside another query by utilizing the syntax below:\n```sql\nselect * from city where city_id={{[pm_query_id:21][0].city_id]};\n```\n  - `{{}}` is used to utilize the variable\n  - `[]` is used to define the `pm_query_id` of desired query\n\n**Using app constants inside query** (Beta stage!)\n```sql\nselect * from city where city_id={{[pm_query_id:22][[pm_query_id:35][0].city_id].city_id}}\nor city_id={{[pm_app_constant_id:4].value}};\n```\n",
        n =
          '\n## **App constants**\n-------------\nApp constants are constants which contain JSON values and can be used for various purposes. There are two type of app constants, Internal and Global.\n\nInternal app constants are used for declaring constants utlized by Jet Admin while Global app constants can be used in Query objects.\n\nBelow are the some app constants\n- [x] CUSTOM_INT_VIEW_MAPPING : Used to render custom mapping for integer values of table column while viewing. Syntax of `CUSTOM_INT_VIEW_MAPPING` is:\n      \n    ```json\n    {\n        table_name: {\n            column_name: {\n                int_value1:label1,\n                int_value2:label2,\n                int_value3:label3,\n                ...\n            }\n        }\n    }\n    ```\n    For example\n    ```json\n    {\n        "restaurant_menu": {\n            "item_id": {\n                "1":"Tea",\n                "23":"Coffee",\n                "34":"Hot chocholate",\n                ...\n            }\n        }\n    }\n    ```\n- [x] CUSTOM_INT_EDIT_MAPPING : Used to render custom mapping for integer values of table column while editing a row. Syntax of `CUSTOM_INT_EDIT_MAPPING` is same as `CUSTOM_INT_VIEW_MAPPING`.\n- [x] APP_NAME : Used to declare custom application name:\n    ```json\n    {\n        "value":"Super food store admin"\n    }\n    ```\n',
        r =
          "\n##### **Cron Syntax Quick Reference**\n\n\n| Schedule | Cron Expression |\n|---|---|\n| Monday at 3 PM | `0 15 * * 1` |\n| Every 15 Minutes | `*/15 * * * *` |\n| First Day of Every Month at 5 AM | `0 5 1 * *` |\n\n\n##### **Fields**\n- **Minute**: `0-59`\n- **Hour**: `0-23`\n- **Day**: `1-31`\n- **Month**: `1-12`\n- **Day of Week**: `0-7` (0 & 7 are Sunday)\n\n##### **Special Characters**\n- **`*`**: Every\n- **`,`**: Multiple\n- **`-`**: Range\n- **`/`**: Increment\n";
    },
    10492: (e, t, a) => {
      a.d(t, { n: () => u });
      var s = a(26240),
        n = a(68903),
        r = a(15795),
        l = a(67254),
        i = a(68577),
        o = a(51962),
        d = (a(59537), a(13733)),
        c = a(70579);
      const u = (e) => {
        var t;
        let { appConstantForm: a } = e;
        const u = (0, s.A)();
        return (0, c.jsxs)(n.Ay, {
          container: !0,
          className: "!w-full",
          style: {},
          children: [
            (0, c.jsxs)(n.Ay, {
              item: !0,
              sx: 12,
              md: 12,
              lg: 12,
              className: "!p-3",
              children: [
                (0, c.jsx)("span", {
                  className: "!text-xs !font-light",
                  children: "Title",
                }),
                (0, c.jsx)(r.A, {
                  required: !0,
                  fullWidth: !0,
                  size: "small",
                  variant: "outlined",
                  type: "text",
                  name: "pm_app_constant_title",
                  value: a.values.pm_app_constant_title,
                  onChange: a.handleChange,
                  onBlur: a.handleBlur,
                }),
              ],
            }),
            (0, c.jsxs)(n.Ay, {
              item: !0,
              sx: 12,
              md: 12,
              lg: 12,
              className: "!px-3",
              children: [
                " ",
                (0, c.jsx)(l.A, {
                  sx: {
                    background: u.palette.background.info,
                    color: u.palette.info.main,
                    "& .MuiAlert-message": { marginTop: 0.2 },
                  },
                  severity: "info",
                  className: "!py-0 !text-xs",
                  children: "Internal app constants should not be deleted",
                }),
              ],
            }),
            (0, c.jsx)(n.Ay, {
              item: !0,
              sx: 12,
              md: 12,
              lg: 12,
              className: "!px-3",
              children: (0, c.jsx)(i.A, {
                control: (0, c.jsx)(o.A, {
                  checked: a.values.is_internal,
                  onChange: (e) => {
                    null === a ||
                      void 0 === a ||
                      a.setFieldValue("is_internal", e.target.checked);
                  },
                }),
                label: "Internal",
              }),
            }),
            (0, c.jsx)(n.Ay, {
              item: !0,
              sx: 12,
              md: 12,
              lg: 12,
              className: "!p-3",
              children: (0, c.jsx)(d.B, {
                code:
                  null !== a &&
                  void 0 !== a &&
                  null !== (t = a.values) &&
                  void 0 !== t &&
                  t.pm_app_constant_value
                    ? "object" === typeof a.values.pm_app_constant_value
                      ? JSON.stringify(a.values.pm_app_constant_value, null, 2)
                      : a.values.pm_app_constant_value
                    : JSON.stringify({}),
                setCode: (e) => {
                  null === a ||
                    void 0 === a ||
                    a.setFieldValue(
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
    2215: (e, t, a) => {
      a.d(t, { H: () => f });
      var s = a(63248),
        n = a(93747),
        r = a(47097),
        l = a(63516),
        i = a(26240),
        o = a(42518),
        d = a(81637),
        c = a(68903),
        u = a(65043),
        m = a(27722),
        p = a(88739),
        x = a(76639),
        h = a(6881),
        _ = a(22168),
        y = a(81953),
        R = a(70579);
      const f = (e) => {
        let { tableName: t, customTitle: a } = e;
        const f = (0, i.A)(),
          E = (0, s.jE)(),
          {
            isLoading: b,
            data: A,
            error: w,
          } = (0, n.I)({
            queryKey: [
              "REACT_QUERY_KEY_TABLES_".concat(String(t).toUpperCase()),
              "add_column",
            ],
            queryFn: () => (0, m.bc)({ tableName: t }),
            cacheTime: 0,
            retry: 1,
            staleTime: 0,
          }),
          N = (0, u.useMemo)(() => {
            if (A) {
              return (0, h.Kt)(A);
            }
            return null;
          }, [A]),
          {
            isPending: S,
            isSuccess: g,
            isError: v,
            error: T,
            mutate: j,
          } = (0, r.n)({
            mutationFn: (e) => {
              let { tableName: t, data: a } = e;
              return (0, m.UZ)({ tableName: t, data: a });
            },
            retry: !1,
            onSuccess: () => {
              (0, x.qq)("Added record successfully"),
                E.invalidateQueries([
                  "REACT_QUERY_KEY_TABLES_".concat(String(t).toUpperCase()),
                ]);
            },
            onError: (e) => {
              (0, x.jx)(e);
            },
          }),
          O = (0, l.Wx)({
            initialValues: {},
            validateOnMount: !1,
            validateOnChange: !1,
            validate: (e) => ({}),
            onSubmit: (e) => {
              j({ tableName: t, data: e });
            },
          });
        return N && N.length > 0
          ? (0, R.jsxs)("div", {
              className:
                "flex flex-col justify-start items-center w-full pb-5 p-2",
              children: [
                (0, R.jsxs)("div", {
                  className:
                    " flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full mt-3 ",
                  children: [
                    (0, R.jsxs)("div", {
                      className: "flex flex-col items-start justify-start",
                      children: [
                        (0, R.jsx)("span", {
                          className: "text-lg font-bold text-start ",
                          children: a || "Add row",
                        }),
                        (0, R.jsx)("span", {
                          style: { color: f.palette.text.secondary },
                          className:
                            "text-xs font-thin text-start text-slate-300",
                          children: "Table : ".concat(t),
                        }),
                      ],
                    }),
                    (0, R.jsx)("div", {
                      className: "flex flex-row items-center justify-end w-min",
                      children: (0, R.jsx)(o.A, {
                        disableElevation: !0,
                        variant: "contained",
                        size: "small",
                        type: "submit",
                        startIcon:
                          S && (0, R.jsx)(d.A, { color: "inherit", size: 12 }),
                        className: "!ml-2",
                        onClick: O.handleSubmit,
                        children: (0, R.jsx)("span", {
                          className: "!w-max",
                          children: "Add record",
                        }),
                      }),
                    }),
                  ],
                }),
                (0, R.jsx)("div", {
                  className:
                    "px-4 mt-3 w-full 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full pb-3",
                  style: {
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: f.palette.divider,
                  },
                  children: (0, R.jsx)("form", {
                    onSubmit: O.handleSubmit,
                    children: (0, R.jsx)(c.Ay, {
                      container: !0,
                      spacing: { xs: 1, md: 2 },
                      columns: { xs: 1, sm: 1, md: 2 },
                      className: "!mt-2",
                      children: N.map((e, t) =>
                        (0, R.jsx)(
                          c.Ay,
                          {
                            item: !0,
                            xs: 12,
                            sm: 12,
                            md: 12,
                            lg: 12,
                            children: (0, R.jsx)(y.K, {
                              type: e.type,
                              name: e.field,
                              value: O.values[e.field],
                              onBlur: O.handleBlur,
                              onChange: O.handleChange,
                              helperText: O.errors[e.field],
                              error: Boolean(O.errors[e.field]),
                              setFieldValue: O.setFieldValue,
                              isList: e.isList,
                            }),
                          },
                          t
                        )
                      ),
                    }),
                  }),
                }),
              ],
            })
          : (0, R.jsx)("div", {
              className: "p-3",
              children: (0, R.jsx)(_.A, {
                error: p.a.ERROR_CODES.PERMISSION_DENIED,
              }),
            });
      };
    },
    15368: (e, t, a) => {
      a.d(t, { Y: () => d });
      a(65043);
      var s = a(98494),
        n = a(26240),
        r = a(55215),
        l = a(87895),
        i = a(6720),
        o = a(70579);
      const d = (e) => {
        let { tip: t } = e;
        const a = (0, n.A)(),
          { themeType: d } = (0, l.i7)();
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
            (0, o.jsx)(s.o, {
              remarkPlugins: [r.A],
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
              children: t,
            }),
          ],
        });
      };
    },
    53978: (e, t, a) => {
      a.r(t), a.d(t, { default: () => y });
      a(2215);
      var s = a(88739),
        n = a(26240),
        r = a(68903),
        l = a(42518),
        i = a(63248),
        o = a(47097),
        d = a(63516),
        c = (a(65043), a(68685), a(73062)),
        u = a(11779),
        m = a(76639),
        p = a(15368),
        x = a(10492),
        h = a(70579);
      const _ = () => {
          const e = (0, n.A)(),
            t = (0, i.jE)(),
            a = (0, d.Wx)({
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
            }),
            {
              isPending: _,
              isSuccess: y,
              isError: R,
              error: f,
              mutate: E,
            } = (0, o.n)({
              mutationFn: (e) => (0, c.dO)({ data: e }),
              retry: !1,
              onSuccess: (e) => {
                (0, m.qq)(s.a.STRINGS.APP_CONSTANT_ADDITION_SUCCESS),
                  t.invalidateQueries([s.a.REACT_QUERY_KEYS.APP_CONSTANTS]);
              },
              onError: (e) => {
                (0, m.jx)(e);
              },
            });
          return (0, h.jsxs)("div", {
            className: "w-full !h-[calc(100vh-50px)] overflow-y-scroll",
            children: [
              (0, h.jsx)("div", {
                className:
                  "flex flex-col items-start justify-start p-3 px-6 w-full",
                style: {
                  background: e.palette.background.paper,
                  borderBottomWidth: 1,
                  borderColor: e.palette.divider,
                },
                children: (0, h.jsx)("span", {
                  className: "text-lg font-bold text-start mt-1 ",
                  children: s.a.STRINGS.APP_CONSTANT_ADDITION_PAGE_TITLE,
                }),
              }),
              (0, h.jsxs)(r.Ay, {
                container: !0,
                children: [
                  (0, h.jsxs)(r.Ay, {
                    item: !0,
                    xl: 6,
                    lg: 6,
                    md: 12,
                    sm: 12,
                    xs: 12,
                    children: [
                      (0, h.jsx)(x.n, { appConstantForm: a }),
                      (0, h.jsx)("div", {
                        className:
                          "!flex flex-row justify-end items-start mt-10 w-full px-3",
                        children: (0, h.jsx)(l.A, {
                          variant: "contained",
                          className: "!ml-3",
                          onClick: () => {
                            E(a.values);
                          },
                          children: s.a.STRINGS.ADD_BUTTON_TEXT,
                        }),
                      }),
                    ],
                  }),
                  (0, h.jsx)(r.Ay, {
                    item: !0,
                    xl: 6,
                    lg: 6,
                    md: 0,
                    sm: 0,
                    xs: 0,
                    className: "!p-3",
                    children: (0, h.jsx)(p.Y, { tip: u.BZ }),
                  }),
                ],
              }),
            ],
          });
        },
        y = () =>
          (0, h.jsx)("div", {
            className:
              "flex flex-col justify-start items-stretch w-full h-full",
            children: (0, h.jsx)(_, {}),
          });
    },
  },
]);
//# sourceMappingURL=5268.04c3f413.chunk.js.map
