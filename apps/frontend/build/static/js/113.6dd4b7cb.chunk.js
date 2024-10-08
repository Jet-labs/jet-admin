"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [113],
  {
    28790: (e, l, s) => {
      s.d(l, { b: () => m });
      s(59537);
      var a = s(11981),
        t = s(65043),
        r = s(26240),
        i = s(68903),
        n = s(68577),
        o = s(19042),
        d = s(15795),
        c = s(39336),
        u = s(70579);
      const m = (e) => {
        let {
          key: l,
          readOnly: s,
          disabled: m,
          onError: h,
          value: p,
          handleChange: x,
          showRawInput: _,
          customStyle: j,
        } = e;
        const [y, b] = (0, t.useState)("24-hour-clock"),
          [E, f] = (0, t.useState)(!0),
          N = (0, r.A)();
        return (0, u.jsxs)(i.Ay, {
          container: !0,
          className: "!w-full",
          style: {
            borderColor: N.palette.divider,
            borderWidth: 1,
            borderRadius: 4,
          },
          children: [
            (0, u.jsx)(i.Ay, {
              item: !0,
              sx: 12,
              md: 12,
              lg: 12,
              className: "!p-3",
              children: (0, u.jsx)(n.A, {
                control: (0, u.jsx)(o.A, {
                  checked: E,
                  onChange: (e, l) => {
                    f(l);
                  },
                }),
                label: "Humanize values",
              }),
            }),
            (0, u.jsxs)(i.Ay, {
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
                  value: p,
                  className: "!mt-1",
                  onChange: (e) => x(e.target.value),
                }),
              ],
            }),
            (0, u.jsx)(c.A, { className: "!w-full !my-5", children: "Or" }),
            (0, u.jsx)(i.Ay, {
              item: !0,
              sx: 12,
              md: 12,
              lg: 12,
              className: "!p-3",
              children: (0, u.jsx)(
                a.l4,
                {
                  value: p,
                  setValue: (e) => {
                    console.log({ v: e, value: p }), x(e);
                  },
                  onError: h || null,
                  disabled: m,
                  readOnly: s,
                  humanizeLabels: E,
                  humanizeValue: E,
                  displayError: !1,
                  clearButton: !0,
                  shortcuts: !0,
                  allowEmpty: !0,
                  clockFormat: y || "24-hour-clock",
                  defaultPeriod: "day",
                  leadingZero: !0,
                  className: j ? "my-project-cron" : void 0,
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
                  clearButtonProps: j ? { type: "default" } : void 0,
                },
                l || "cron-job-scheduler"
              ),
            }),
          ],
        });
      };
    },
    93714: (e, l, s) => {
      s.r(l), s.d(l, { default: () => C });
      var a = s(65043),
        t = s(73216),
        r = s(26240),
        i = s(68903),
        n = s(53193),
        o = s(15795),
        d = s(72221),
        c = s(32143),
        u = s(42518),
        m = s(63248),
        h = s(93747),
        p = s(47097),
        x = s(63516),
        _ = (s(68685), s(66129)),
        j = s(35113),
        y = s(83359),
        b = s(76639),
        E = s(28790),
        f = s(17160),
        N = s(56249),
        v = s(45394),
        S = s(88739),
        A = s(70579);
      const T = (e) => {
          let { pmJobID: l } = e;
          const { pmUser: s } = (0, f.hD)(),
            r = (0, m.jE)(),
            [i, n] = (0, a.useState)(!1),
            o = (0, t.Zp)(),
            d = (0, a.useMemo)(
              () => !!s && s.extractJobDeleteAuthorization(l),
              [s, l]
            ),
            {
              isPending: c,
              isSuccess: h,
              isError: x,
              error: j,
              mutate: y,
            } = (0, p.n)({
              mutationFn: (e) => {
                let { pmJobID: l } = e;
                return (0, _.rW)({ pmJobID: l });
              },
              retry: !1,
              onSuccess: () => {
                (0, b.qq)(S.a.STRINGS.JOB_DELETED_SUCCESS),
                  r.invalidateQueries([S.a.REACT_QUERY_KEYS.JOBS]),
                  o(S.a.ROUTES.ALL_JOBS.path()),
                  n(!1);
              },
              onError: (e) => {
                (0, b.jx)(e);
              },
            });
          return (
            d &&
            (0, A.jsxs)(A.Fragment, {
              children: [
                (0, A.jsx)(u.A, {
                  onClick: () => {
                    n(!0);
                  },
                  startIcon: (0, A.jsx)(v.tW_, { className: "!text-sm" }),
                  size: "medium",
                  variant: "outlined",
                  className: "!ml-2",
                  color: "error",
                  children: S.a.STRINGS.DELETE_BUTTON_TEXT,
                }),
                (0, A.jsx)(N.K, {
                  open: i,
                  onAccepted: () => {
                    y({ pmJobID: l });
                  },
                  onDecline: () => {
                    n(!1);
                  },
                  title: S.a.STRINGS.JOB_DELETION_CONFIRMATION_TITLE,
                  message: ""
                    .concat(S.a.STRINGS.JOB_DELETION_CONFIRMATION_BODY, " - ")
                    .concat(l),
                }),
              ],
            })
          );
        },
        g = (e) => {
          let { id: l } = e;
          const s = (0, r.A)(),
            t = (0, m.jE)(),
            {
              isLoading: f,
              data: N,
              error: v,
            } = (0, h.I)({
              queryKey: [S.a.REACT_QUERY_KEYS.JOBS, l],
              queryFn: () => (0, _.il)({ pmJobID: l }),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            }),
            {
              isLoading: g,
              data: C,
              error: I,
              refetch: R,
            } = (0, h.I)({
              queryKey: [S.a.REACT_QUERY_KEYS.QUERIES],
              queryFn: () => (0, j.Q2)(),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            }),
            O = (0, x.Wx)({
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
            });
          (0, a.useEffect)(() => {
            O &&
              N &&
              (O.setFieldValue("pm_job_id", N.pm_job_id),
              O.setFieldValue("pm_job_title", N.pm_job_title),
              O.setFieldValue("pm_query_id", N.pm_query_id),
              O.setFieldValue("pm_job_schedule", N.pm_job_schedule));
          }, [N]);
          const {
              isPending: D,
              isSuccess: w,
              isError: q,
              error: B,
              mutate: k,
            } = (0, p.n)({
              mutationFn: (e) => (0, _.bz)({ data: e }),
              retry: !1,
              onSuccess: (e) => {
                (0, b.qq)(S.a.STRINGS.JOB_UPDATED_SUCCESS),
                  t.invalidateQueries([S.a.REACT_QUERY_KEYS.JOBS]);
              },
              onError: (e) => {
                (0, b.jx)(e);
              },
            }),
            J = (0, a.useCallback)(
              (e) => {
                null === O ||
                  void 0 === O ||
                  O.setFieldValue("pm_job_schedule", e);
              },
              [O]
            );
          return (0, A.jsxs)("div", {
            className: "w-full !h-[calc(100vh-100px)]",
            children: [
              (0, A.jsxs)("div", {
                className: "flex flex-col items-start justify-start p-3 ",
                style: {
                  background: s.palette.background.default,
                  borderBottomWidth: 1,
                  borderColor: s.palette.divider,
                },
                children: [
                  (0, A.jsx)("span", {
                    className: "text-lg font-bold text-start",
                    children: S.a.STRINGS.JOB_UPDATE_PAGE_TITLE,
                  }),
                  (0, A.jsx)("span", {
                    className: "text-xs font-medium text-start mt-1",
                    children: "Job id : ".concat(l),
                  }),
                ],
              }),
              (0, A.jsxs)(i.Ay, {
                container: !0,
                className: "!h-full",
                children: [
                  (0, A.jsxs)(i.Ay, {
                    item: !0,
                    sx: 4,
                    md: 4,
                    lg: 4,
                    className: "w-full",
                    children: [
                      (0, A.jsxs)(n.A, {
                        fullWidth: !0,
                        size: "small",
                        className: "!mt-2 !px-3",
                        children: [
                          (0, A.jsx)("span", {
                            className: "text-xs font-light  !capitalize mb-1",
                            children: "Title",
                          }),
                          (0, A.jsx)(o.A, {
                            required: !0,
                            fullWidth: !0,
                            size: "small",
                            variant: "outlined",
                            type: "text",
                            name: "pm_job_title",
                            value: O.values.pm_job_title,
                            onChange: O.handleChange,
                            onBlur: O.handleBlur,
                          }),
                        ],
                      }),
                      (0, A.jsxs)(n.A, {
                        fullWidth: !0,
                        size: "small",
                        className: "!mt-2 !px-3",
                        children: [
                          (0, A.jsx)("span", {
                            className: "text-xs font-light  !capitalize mb-1",
                            children: "Select query",
                          }),
                          (0, A.jsx)(d.A, {
                            name: "pm_query_id",
                            value: O.values.pm_query_id,
                            onBlur: O.handleBlur,
                            onChange: O.handleChange,
                            required: !0,
                            size: "small",
                            fullWidth: !0,
                            children:
                              null === C || void 0 === C
                                ? void 0
                                : C.map((e) =>
                                    (0, A.jsx)(c.A, {
                                      value: e.pm_query_id,
                                      children: (0, A.jsxs)("div", {
                                        className:
                                          "!flex flex-row justify-start items-center",
                                        children: [
                                          y.R[e.pm_query_type].icon,
                                          (0, A.jsx)("span", {
                                            className: "ml-2",
                                            children: e.pm_query_title,
                                          }),
                                        ],
                                      }),
                                    })
                                  ),
                          }),
                        ],
                      }),
                      (0, A.jsxs)("div", {
                        className:
                          "!flex flex-row justify-end items-center mt-10 w-100 px-3",
                        children: [
                          (0, A.jsx)(T, { pmJobID: l }),
                          (0, A.jsx)(u.A, {
                            variant: "contained",
                            className: "!ml-3",
                            onClick: () => {
                              k(O.values);
                            },
                            children: S.a.STRINGS.UPDATE_BUTTON_TEXT,
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, A.jsxs)(i.Ay, {
                    item: !0,
                    sx: 8,
                    md: 8,
                    lg: 8,
                    className: "w-full !h-full !p-2",
                    children: [
                      (0, A.jsx)("span", {
                        className: "text-xs font-light  !capitalize mb-1",
                        children: "Schedule the job",
                      }),
                      (0, A.jsx)(E.b, {
                        value: O.values.pm_job_schedule,
                        handleChange: J,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        },
        C = () => {
          const { id: e } = (0, t.g)();
          return (0, A.jsx)(g, { id: e });
        };
    },
    26600: (e, l, s) => {
      s.d(l, { A: () => _ });
      var a = s(58168),
        t = s(98587),
        r = s(65043),
        i = s(58387),
        n = s(68606),
        o = s(85865),
        d = s(34535),
        c = s(98206),
        u = s(87034),
        m = s(2563),
        h = s(70579);
      const p = ["className", "id"],
        x = (0, d.Ay)(o.A, {
          name: "MuiDialogTitle",
          slot: "Root",
          overridesResolver: (e, l) => l.root,
        })({ padding: "16px 24px", flex: "0 0 auto" }),
        _ = r.forwardRef(function (e, l) {
          const s = (0, c.b)({ props: e, name: "MuiDialogTitle" }),
            { className: o, id: d } = s,
            _ = (0, t.A)(s, p),
            j = s,
            y = ((e) => {
              const { classes: l } = e;
              return (0, n.A)({ root: ["root"] }, u.t, l);
            })(j),
            { titleId: b = d } = r.useContext(m.A);
          return (0,
          h.jsx)(x, (0, a.A)({ component: "h2", className: (0, i.A)(y.root, o), ownerState: j, ref: l, variant: "h6", id: null != d ? d : b }, _));
        });
    },
  },
]);
//# sourceMappingURL=113.6dd4b7cb.chunk.js.map
