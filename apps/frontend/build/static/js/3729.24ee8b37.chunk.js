"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [3729],
  {
    13733: (e, l, s) => {
      s.d(l, { B: () => h });
      var t = s(65043),
        a = s(72890),
        r = s(57643),
        i = s(95043),
        n = s(67680),
        o = s(15346),
        d = s(81747),
        c = s(26240),
        u = s(87895),
        m = s(25196),
        x = s(70579);
      const p = {
          javascript: (0, r.javascript)(),
          json: (0, i.json)(),
          sql: (0, n.sql)(),
          pgsql: (0, m.rI)("pgsql"),
        },
        h = (e) => {
          let {
            readOnly: l,
            disabled: s,
            code: r,
            setCode: i,
            language: n = "json",
            height: m = "200px",
            outlined: h = !0,
            transparent: j = !1,
            rounded: f = !0,
          } = e;
          const y = (0, c.A)(),
            b = (0, t.useRef)(),
            { themeType: A } = (0, u.i7)();
          return (0, x.jsx)(a.Ay, {
            readOnly: l || s,
            ref: b,
            value: r,
            height: m,
            width: "100%",
            maxWidth: "1000px",
            extensions: [p[n]],
            onChange: i,
            theme: "dark" == A ? d.Ts : o.al,
            basicSetup: { closeBrackets: !0, indentOnInput: !0 },
            style: {
              borderWidth: h ? 1 : 0,
              borderColor: y.palette.divider,
              borderRadius: h ? 4 : 0,
            },
            className: f ? "codemirror-editor-rounded" : "",
            indentWithTab: !0,
          });
        };
    },
    81953: (e, l, s) => {
      s.d(l, { K: () => w });
      var t = s(45903),
        a = s(26240),
        r = s(53193),
        i = s(15795),
        n = s(72221),
        o = s(32143),
        d = s(74050),
        c = s(96446),
        u = s(43845),
        m = s(931),
        x = s(76879),
        p = s(58390),
        h = s(98452),
        j = s(53536),
        f = s(86178),
        y = s.n(f),
        b = s(88739),
        A = s(13733),
        N = s(60184),
        T = s(68903),
        _ = s(25673),
        g = s(17392),
        v = s(65043),
        C = s(45394),
        E = s(70579);
      const S = (e) => {
          let { value: l, onChange: s, onDelete: t, type: r } = e;
          const i = (0, a.A)();
          return (0, E.jsx)(T.Ay, {
            item: !0,
            xs: 6,
            sm: 4,
            md: 4,
            lg: 3,
            xl: 3,
            className: "!p-1",
            children: (0, E.jsxs)("div", {
              style: {
                borderColor: i.palette.divider,
                borderWidth: 1,
                background: i.palette.background.paper,
              },
              className:
                "flex flex-row justify-start items-center rounded px-2 h-[32px]",
              children: [
                (0, E.jsx)(_.Ay, {
                  sx: { flex: 1, "& .MuiInputBase-input": { padding: 0 } },
                  placeholder: "Add value here",
                  className: "!p-0",
                  type: r,
                  value: l,
                  onChange: (e) => {
                    s(e.target.value);
                  },
                }),
                (0, E.jsx)(g.A, {
                  color: "primary",
                  "aria-label": "directions",
                  className: "!p-0",
                  onClick: t,
                  children: (0, E.jsx)(C.$8F, {
                    className: "!text-base",
                    style: { margin: 0 },
                  }),
                }),
              ],
            }),
          });
        },
        I = (e) => {
          let { handleAddValue: l, type: s } = e;
          const t = (0, a.A)(),
            [r, i] = (0, v.useState)("number" == s ? 0 : "");
          return (0, E.jsx)(T.Ay, {
            item: !0,
            xs: 6,
            sm: 4,
            md: 4,
            lg: 3,
            xl: 3,
            className: "!p-1",
            children: (0, E.jsxs)("div", {
              style: {
                borderColor: t.palette.divider,
                borderWidth: 1,
                background: t.palette.background.secondary,
              },
              className:
                "flex flex-row justify-start items-center rounded px-2 h-[32px]",
              children: [
                (0, E.jsx)(_.Ay, {
                  sx: { flex: 1, "& .MuiInputBase-input": { padding: 0 } },
                  placeholder: "Add value here",
                  className: "!p-0",
                  type: s,
                  value: r,
                  onChange: (e) => {
                    i(e.target.value);
                  },
                }),
                (0, E.jsx)(g.A, {
                  color: "primary",
                  "aria-label": "directions",
                  className: "!p-0",
                  onClick: () => l(r),
                  children: (0, E.jsx)(N.OiG, {
                    className: "!text-sm",
                    style: { margin: 0 },
                  }),
                }),
              ],
            }),
          });
        },
        O = (e) => {
          let { value: l, onChange: s, type: t } = e;
          (0, a.A)();
          const r = (e, a) => {
            const r = [...l];
            (r[e] = "number" === t ? parseInt(a) : a), s(r);
          };
          return (0, E.jsxs)(T.Ay, {
            container: !0,
            className: "!w-full !rounded !flex-grow",
            children: [
              Array.isArray(l) &&
                l.map((e, a) =>
                  (0, E.jsx)(S, {
                    value: e,
                    type: t,
                    onChange: (e) => r(a, e),
                    onDelete: () =>
                      ((e) => {
                        const t = [...l];
                        t.splice(e, 1), s(t);
                      })(a),
                  })
                ),
              (0, E.jsx)(I, {
                type: t,
                handleAddValue: (e) => {
                  const a = [...l];
                  a.push("number" === t ? parseInt(e) : e), s(a);
                },
              }),
            ],
          });
        },
        w = (e) => {
          let {
            type: l,
            isList: s,
            onChange: f,
            onBlur: T,
            value: _,
            helperText: g,
            error: v,
            name: C,
            required: S,
            readOnly: I,
            dateTimePicker: w = "normal",
            customMapping: B,
            selectOptions: W,
            setFieldValue: D,
            showDefault: z,
            language: P,
            customLabel: k,
          } = e;
          const L = (0, a.A)(),
            Y = (0, t.A)("normal" === w ? m.K : x.I)((e) => {
              let { theme: l } = e;
              return { "& .MuiInputBase-input": { padding: "8.5px 14px" } };
            }),
            q = (0, j.lowerCase)(C);
          let F = null;
          switch (l) {
            case b.a.DATA_TYPES.STRING:
              F = (0, E.jsxs)(r.A, {
                fullWidth: !0,
                className: "!flex !flex-col !justify-start !items-start",
                size: "small",
                children: [
                  k ||
                    (q &&
                      (0, E.jsx)("span", {
                        className: "text-xs font-light mb-1",
                        style: { color: L.palette.text.secondary },
                        children: q,
                      })),
                  (0, E.jsx)(i.A, {
                    disabled: I,
                    required: S,
                    fullWidth: !0,
                    size: "small",
                    variant: "outlined",
                    type: "text",
                    name: C,
                    onChange: f,
                    onBlur: T,
                    value: _,
                    helperText: g,
                    error: v,
                  }),
                ],
              });
              break;
            case b.a.DATA_TYPES.COLOR:
              F = (0, E.jsxs)(r.A, {
                fullWidth: !0,
                className: "!flex !flex-col !justify-start !items-start",
                size: "small",
                children: [
                  k ||
                    (q &&
                      (0, E.jsx)("span", {
                        style: { color: L.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: q,
                      })),
                  (0, E.jsx)(i.A, {
                    disabled: I,
                    required: S,
                    fullWidth: !0,
                    size: "small",
                    variant: "outlined",
                    type: "color",
                    name: C,
                    onChange: f,
                    onBlur: T,
                    value: _,
                    helperText: g,
                    error: v,
                  }),
                ],
              });
              break;
            case b.a.DATA_TYPES.CODE:
              F = (0, E.jsxs)(r.A, {
                fullWidth: !0,
                className: "!flex !flex-col !justify-start !items-start",
                size: "small",
                children: [
                  k ||
                    (q &&
                      (0, E.jsx)("span", {
                        style: { color: L.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: q,
                      })),
                  (0, E.jsx)(A.B, {
                    disabled: I,
                    required: S,
                    fullWidth: !0,
                    size: "small",
                    variant: "outlined",
                    type: "color",
                    name: C,
                    setCode: (e) => {
                      D(C, e ? JSON.parse(e) : e);
                    },
                    onBlur: T,
                    code: _,
                    helperText: g,
                    error: v,
                  }),
                ],
              });
              break;
            case b.a.DATA_TYPES.SINGLE_SELECT:
              F = (0, E.jsxs)(r.A, {
                fullWidth: !0,
                size: "small",
                children: [
                  k ||
                    (q &&
                      (0, E.jsx)("span", {
                        style: { color: L.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: q,
                      })),
                  (0, E.jsx)(n.A, {
                    id: C,
                    value: _,
                    onChange: f,
                    onBlur: T,
                    error: v,
                    name: C,
                    disabled: I,
                    required: S,
                    fullWidth: !0,
                    size: "small",
                    children:
                      null === W || void 0 === W
                        ? void 0
                        : W.map((e) => {
                            const l = (0, j.isNull)(e.value) ? e : e.value,
                              s = e.label ? e.label : l;
                            return (0, E.jsx)(o.A, { value: l, children: s });
                          }),
                  }),
                  v &&
                    (0, E.jsx)("span", {
                      className: "mt-2 text-red-500",
                      children: v,
                    }),
                ],
              });
              break;
            case b.a.DATA_TYPES.MULTIPLE_SELECT:
              F = (0, E.jsxs)(r.A, {
                fullWidth: !0,
                size: "small",
                children: [
                  k ||
                    (q &&
                      (0, E.jsx)("span", {
                        style: { color: L.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: q,
                      })),
                  (0, E.jsx)(n.A, {
                    id: C,
                    multiple: !0,
                    value: _,
                    onChange: f,
                    onBlur: T,
                    error: v,
                    name: C,
                    disabled: I,
                    required: S,
                    fullWidth: !0,
                    size: "small",
                    input: (0, E.jsx)(d.A, {
                      id: "select-multiple-chip",
                      label: "Chip",
                      size: "small",
                    }),
                    renderValue: (e) =>
                      (0, E.jsx)(c.A, {
                        sx: { display: "flex", flexWrap: "wrap", gap: 0.5 },
                        children: e.map((e) =>
                          (0, E.jsx)(
                            u.A,
                            { label: e.label, size: "small", color: "primary" },
                            e.value
                          )
                        ),
                      }),
                    children:
                      null === W || void 0 === W
                        ? void 0
                        : W.map((e) =>
                            (0, E.jsx)(
                              o.A,
                              { value: e, children: e.label },
                              e.value
                            )
                          ),
                  }),
                  v &&
                    (0, E.jsx)("span", {
                      className: "mt-2 text-red-500 font-thin text-xs",
                      children: v,
                    }),
                ],
              });
              break;
            case b.a.DATA_TYPES.BOOLEAN:
              F = (0, E.jsxs)(r.A, {
                fullWidth: !0,
                className: "!flex !flex-col !justify-start !items-start",
                size: "small",
                children: [
                  k ||
                    (q &&
                      (0, E.jsx)("span", {
                        style: { color: L.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: q,
                      })),
                  (0, E.jsxs)(n.A, {
                    id: C,
                    name: C,
                    onChange: f,
                    onBlur: T,
                    value: Boolean(_),
                    error: v,
                    IconComponent: () =>
                      (0, E.jsx)(N.Vr3, { className: "!text-sm" }),
                    className: " !w-full",
                    required: S,
                    disabled: I,
                    children: [
                      (0, E.jsx)(o.A, {
                        value: !0,
                        className: "!break-words !whitespace-pre-line",
                        children: "True",
                      }),
                      (0, E.jsx)(o.A, {
                        value: !1,
                        className: "!break-words !whitespace-pre-line",
                        children: "False",
                      }),
                    ],
                  }),
                ],
              });
              break;
            case b.a.DATA_TYPES.DATETIME:
              F = (0, E.jsxs)(r.A, {
                fullWidth: !0,
                className:
                  "!flex !flex-col !justify-start !items-start !w-full",
                size: "small",
                children: [
                  k ||
                    (q &&
                      (0, E.jsx)("span", {
                        style: { color: L.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: q,
                      })),
                  (0, E.jsx)(p.$, {
                    dateAdapter: h.Y,
                    children: (0, E.jsx)(Y, {
                      name: C,
                      onChange: f,
                      onBlur: T,
                      value: _ ? y()(new Date(_)) : null,
                      helperText: g,
                      error: v,
                      className: "!w-full",
                      disabled: I,
                    }),
                  }),
                ],
              });
              break;
            case b.a.DATA_TYPES.JSON:
              F = (0, E.jsxs)(r.A, {
                fullWidth: !0,
                size: "small",
                children: [
                  k ||
                    (q &&
                      (0, E.jsx)("span", {
                        style: { color: L.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: q,
                      })),
                  (0, E.jsx)(A.B, {
                    disabled: I,
                    required: S,
                    fullWidth: !0,
                    size: "small",
                    variant: "outlined",
                    type: "color",
                    name: C,
                    setCode: (e) => {
                      D(C, e ? JSON.parse(e) : e);
                    },
                    language: P || "json",
                    onBlur: T,
                    code:
                      "object" === typeof _ ? JSON.stringify(_, null, 2) : _,
                    helperText: g,
                    error: v,
                  }),
                ],
              });
              break;
            case b.a.DATA_TYPES.INT:
              var R;
              F = s
                ? (0, E.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      k ||
                        (q &&
                          (0, E.jsx)("span", {
                            style: { color: L.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: q,
                          })),
                      (0, E.jsx)(O, {
                        value: _,
                        onChange: (e) => D(C, e),
                        type: "number",
                      }),
                    ],
                  })
                : B
                ? (0, E.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      k ||
                        (q &&
                          (0, E.jsx)("span", {
                            style: { color: L.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: q,
                          })),
                      (0, E.jsx)(n.A, {
                        name: C,
                        onChange: f,
                        onBlur: T,
                        value: parseInt(_),
                        IconComponent: () =>
                          (0, E.jsx)(N.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === (R = Object.keys(B)) || void 0 === R
                            ? void 0
                            : R.map((e, l) =>
                                (0, E.jsx)(
                                  o.A,
                                  {
                                    value: parseInt(e),
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: B[e],
                                  },
                                  l
                                )
                              ),
                      }),
                    ],
                  })
                : (0, E.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      k ||
                        (q &&
                          (0, E.jsx)("span", {
                            style: { color: L.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: q,
                          })),
                      (0, E.jsx)(i.A, {
                        required: S,
                        fullWidth: !0,
                        size: "small",
                        variant: "outlined",
                        type: "number",
                        name: C,
                        onChange: f,
                        onBlur: T,
                        value: _,
                        helperText: g,
                        error: v,
                        disabled: I,
                      }),
                    ],
                  });
              break;
            case b.a.DATA_TYPES.FLOAT:
              var V;
              F = B
                ? (0, E.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      k ||
                        (q &&
                          (0, E.jsx)("span", {
                            style: { color: L.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: q,
                          })),
                      (0, E.jsx)(n.A, {
                        name: C,
                        onChange: f,
                        onBlur: T,
                        value: parseInt(_),
                        IconComponent: () =>
                          (0, E.jsx)(N.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === (V = Object.keys(B)) || void 0 === V
                            ? void 0
                            : V.map((e, l) =>
                                (0, E.jsx)(
                                  o.A,
                                  {
                                    value: parseInt(e),
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: B[e],
                                  },
                                  l
                                )
                              ),
                      }),
                    ],
                  })
                : (0, E.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      k ||
                        (q &&
                          (0, E.jsx)("span", {
                            style: { color: L.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: q,
                          })),
                      (0, E.jsx)(i.A, {
                        required: S,
                        fullWidth: !0,
                        size: "small",
                        variant: "outlined",
                        type: "number",
                        name: C,
                        onChange: f,
                        onBlur: T,
                        value: _,
                        helperText: g,
                        error: v,
                        disabled: I,
                      }),
                    ],
                  });
              break;
            case b.a.DATA_TYPES.DECIMAL:
              var M;
              F = B
                ? (0, E.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      k ||
                        (q &&
                          (0, E.jsx)("span", {
                            style: { color: L.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: q,
                          })),
                      (0, E.jsx)(n.A, {
                        name: C,
                        onChange: f,
                        onBlur: T,
                        value: parseInt(_),
                        IconComponent: () =>
                          (0, E.jsx)(N.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === (M = Object.keys(B)) || void 0 === M
                            ? void 0
                            : M.map((e, l) =>
                                (0, E.jsx)(
                                  o.A,
                                  {
                                    value: parseInt(e),
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: B[e],
                                  },
                                  l
                                )
                              ),
                      }),
                    ],
                  })
                : (0, E.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      k ||
                        (q &&
                          (0, E.jsx)("span", {
                            style: { color: L.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: q,
                          })),
                      (0, E.jsx)(i.A, {
                        required: S,
                        fullWidth: !0,
                        size: "small",
                        variant: "outlined",
                        type: "number",
                        name: C,
                        onChange: f,
                        onBlur: T,
                        value: _,
                        helperText: g,
                        error: v,
                        disabled: I,
                      }),
                    ],
                  });
              break;
            default:
              F = z
                ? (0, E.jsxs)(r.A, {
                    fullWidth: !0,
                    size: "small",
                    children: [
                      k ||
                        (q &&
                          (0, E.jsx)("span", {
                            style: { color: L.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: q,
                          })),
                      (0, E.jsx)(A.B, {
                        disabled: I,
                        required: S,
                        fullWidth: !0,
                        size: "small",
                        variant: "outlined",
                        type: "color",
                        name: C,
                        setCode: (e) => {
                          D(C, e ? JSON.parse(e) : e);
                        },
                        language: P || "json",
                        onBlur: T,
                        code:
                          "object" === typeof _
                            ? JSON.stringify(_, null, 2)
                            : _,
                        helperText: g,
                        error: v,
                      }),
                    ],
                  })
                : null;
          }
          return F;
        };
    },
    3729: (e, l, s) => {
      s.r(l), s.d(l, { default: () => C });
      var t = s(73216),
        a = s(26240),
        r = s(42518),
        i = s(81637),
        n = s(68903),
        o = s(91527),
        d = s(93747),
        c = s(47097),
        u = s(63516),
        m = s(65043),
        x = s(81953),
        p = s(30502),
        h = (s(27722), s(88739)),
        j = s(76639),
        f = s(5737),
        y = s(63248),
        b = s(45394),
        A = s(17160),
        N = s(56249),
        T = s(90827),
        _ = s(70579);
      const g = (e) => {
          let { id: l } = e;
          const { pmUser: s } = (0, A.hD)(),
            a = (0, y.jE)(),
            i = (0, t.Zp)(),
            [n, o] = (0, m.useState)(!1),
            d = (0, m.useMemo)(() => {
              if (s && s) {
                return !!s.extractRowDeleteAuthorization(
                  h.a.STRINGS.POLICY_OBJECT_TABLE_NAME
                );
              }
              return !1;
            }, [s]),
            {
              isPending: u,
              isSuccess: x,
              isError: p,
              error: f,
              mutate: g,
            } = (0, c.n)({
              mutationFn: (e) => {
                let { id: l } = e;
                return (0, T.ak)({ pmPolicyObjectID: l });
              },
              retry: !1,
              onSuccess: () => {
                (0, j.qq)(h.a.STRINGS.POLICY_DELETED_SUCCESS),
                  a.invalidateQueries([h.a.REACT_QUERY_KEYS.POLICIES]),
                  i(-1),
                  o(!1);
              },
              onError: (e) => {
                (0, j.jx)(e);
              },
            });
          return (
            d &&
            (0, _.jsxs)(_.Fragment, {
              children: [
                (0, _.jsx)(r.A, {
                  onClick: () => {
                    o(!0);
                  },
                  startIcon: (0, _.jsx)(b.tW_, { className: "!text-sm" }),
                  size: "medium",
                  variant: "outlined",
                  className: "!ml-2",
                  color: "error",
                  children: h.a.STRINGS.DELETE_BUTTON_TEXT,
                }),
                (0, _.jsx)(N.K, {
                  open: n,
                  onAccepted: () => {
                    g({ id: l });
                  },
                  onDecline: () => {
                    o(!1);
                  },
                  title: h.a.STRINGS.POLICY_DELETION_CONFIRMATION_TITLE,
                  message: ""
                    .concat(
                      h.a.STRINGS.POLICY_DELETION_CONFIRMATION_BODY,
                      " - "
                    )
                    .concat(l),
                }),
              ],
            })
          );
        },
        v = (e) => {
          let { id: l } = e;
          const s = (0, a.A)(),
            t = new o.E(),
            {
              isLoading: y,
              data: b,
              error: A,
            } = (0, d.I)({
              queryKey: [h.a.REACT_QUERY_KEYS.POLICIES, l],
              queryFn: () => (0, T.Jl)({ pmPolicyObjectID: l }),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            }),
            {
              isPending: N,
              isSuccess: v,
              isError: C,
              error: E,
              mutate: S,
            } = (0, c.n)({
              mutationFn: (e) => {
                let { data: l } = e;
                return (0, T.gu)({ data: l });
              },
              retry: !1,
              onSuccess: () => {
                (0, j.qq)(h.a.STRINGS.POLICY_UPDATED_SUCCESS),
                  t.invalidateQueries([h.a.REACT_QUERY_KEYS.POLICIES]);
              },
              onError: (e) => {
                (0, j.jx)(e);
              },
            }),
            I = (0, u.Wx)({
              initialValues: {},
              validateOnMount: !1,
              validateOnChange: !1,
              validate: (e) => ({}),
              onSubmit: (e) => {
                S({ id: l, data: e });
              },
            });
          return (
            (0, m.useEffect)(() => {
              b &&
                (I.setFieldValue("pm_policy_object_id", l),
                I.setFieldValue(
                  "pm_policy_object_title",
                  b.pmPolicyObjectTitle
                ),
                I.setFieldValue("is_disabled", b.isDisabled),
                I.setFieldValue("pm_policy_object", b.pmPolicyObject));
            }, [b]),
            y || y || !b
              ? (0, _.jsx)(f.R, {})
              : (0, _.jsxs)("div", {
                  className:
                    "flex flex-col justify-start items-center w-full pb-5 p-2",
                  children: [
                    (0, _.jsxs)("div", {
                      className:
                        " flex flex-row justify-between 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full  mt-3 w-full ",
                      children: [
                        (0, _.jsxs)("div", {
                          className: "flex flex-col items-start justify-start",
                          children: [
                            (0, _.jsx)("span", {
                              className: "text-lg font-bold text-start ",
                              children: h.a.STRINGS.POLICY_UPDATE_PAGE_TITLE,
                            }),
                            (0, _.jsx)("span", {
                              className:
                                "text-xs font-thin text-start text-slate-300",
                              children: "Account settings | Username : ".concat(
                                b.title
                              ),
                            }),
                          ],
                        }),
                        (0, _.jsxs)("div", {
                          className:
                            "flex flex-row items-center justify-end w-min ",
                          children: [
                            (0, _.jsx)(g, { id: l }),
                            (0, _.jsx)(r.A, {
                              disableElevation: !0,
                              variant: "contained",
                              size: "small",
                              type: "submit",
                              startIcon:
                                N &&
                                (0, _.jsx)(i.A, { color: "inherit", size: 12 }),
                              className: "!ml-2",
                              onClick: I.submitForm,
                              children: h.a.STRINGS.UPDATE_BUTTON_TEXT,
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, _.jsxs)("form", {
                      className:
                        "!flex !flex-col justify-start items-stretch 2xl:w-3/5 xl:w-3/4 lg:w-2/3 md:w-full",
                      onSubmit: I.handleSubmit,
                      children: [
                        (0, _.jsx)("div", {
                          className: "p-4 mt-3 w-full pt-0",
                          style: {
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: s.palette.divider,
                          },
                          children: (0, _.jsxs)(n.Ay, {
                            container: !0,
                            rowSpacing: 2,
                            className: "!mt-2",
                            children: [
                              (0, _.jsx)(
                                n.Ay,
                                {
                                  item: !0,
                                  xs: 12,
                                  sm: 12,
                                  md: 12,
                                  lg: 12,
                                  children: (0, _.jsx)(x.K, {
                                    type: h.a.DATA_TYPES.INT,
                                    name: "pm_policy_object_id",
                                    value: I.values.pm_policy_object_id,
                                    onBlur: I.handleBlur,
                                    onChange: I.handleChange,
                                    setFieldValue: I.setFieldValue,
                                    helperText: I.errors.pm_policy_object_id,
                                    error: Boolean(
                                      I.errors.pm_policy_object_id
                                    ),
                                    required: !0,
                                  }),
                                },
                                "pm_policy_object_id"
                              ),
                              (0, _.jsx)(
                                n.Ay,
                                {
                                  item: !0,
                                  xs: 12,
                                  sm: 12,
                                  md: 12,
                                  lg: 12,
                                  children: (0, _.jsx)(x.K, {
                                    type: h.a.DATA_TYPES.STRING,
                                    name: "pm_policy_object_title",
                                    value: I.values.pm_policy_object_title,
                                    onBlur: I.handleBlur,
                                    onChange: I.handleChange,
                                    setFieldValue: I.setFieldValue,
                                    helperText: I.errors.pm_policy_object_title,
                                    error: Boolean(
                                      I.errors.pm_policy_object_title
                                    ),
                                    required: !0,
                                    customMapping: null,
                                  }),
                                },
                                "pm_policy_object_title"
                              ),
                              (0, _.jsx)(
                                n.Ay,
                                {
                                  item: !0,
                                  xs: 12,
                                  sm: 12,
                                  md: 12,
                                  lg: 12,
                                  children: (0, _.jsx)(x.K, {
                                    type: h.a.DATA_TYPES.BOOLEAN,
                                    name: "is_disabled",
                                    value: I.values.is_disabled,
                                    onBlur: I.handleBlur,
                                    onChange: I.handleChange,
                                    setFieldValue: I.setFieldValue,
                                    helperText: I.errors.is_disabled,
                                    error: Boolean(I.errors.is_disabled),
                                    required: !0,
                                    customMapping: null,
                                  }),
                                },
                                "is_disabled"
                              ),
                            ],
                          }),
                        }),
                        (0, _.jsx)(p.z, {
                          policy: I.values.pm_policy_object,
                          handleChange: (e) => {
                            I.setFieldValue("pm_policy_object", e);
                          },
                          containerClass: "!mt-4",
                        }),
                      ],
                    }),
                  ],
                })
          );
        },
        C = () => {
          const { id: e } = (0, t.g)();
          return (0, _.jsx)(v, { id: e });
        };
    },
  },
]);
//# sourceMappingURL=3729.24ee8b37.chunk.js.map
