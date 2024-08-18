"use strict";
(self.webpackChunkjetadmin_frontend =
  self.webpackChunkjetadmin_frontend || []).push([
  [1034],
  {
    13733: (e, l, a) => {
      a.d(l, { B: () => p });
      var s = a(65043),
        t = a(72890),
        r = a(57643),
        n = a(95043),
        i = a(67680),
        o = a(15346),
        c = a(81747),
        d = a(26240),
        u = a(87895),
        m = a(25196),
        x = a(70579);
      const h = {
          javascript: (0, r.javascript)(),
          json: (0, n.json)(),
          sql: (0, i.sql)(),
          pgsql: (0, m.rI)("pgsql"),
        },
        p = (e) => {
          let {
            readOnly: l,
            disabled: a,
            code: r,
            setCode: n,
            language: i = "json",
            height: m = "200px",
            outlined: p = !0,
            transparent: y = !1,
            rounded: j = !0,
          } = e;
          const f = (0, d.A)(),
            v = (0, s.useRef)(),
            { themeType: A } = (0, u.i7)();
          return (0, x.jsx)(t.Ay, {
            readOnly: l || a,
            ref: v,
            value: r,
            height: m,
            width: "100%",
            maxWidth: "1000px",
            extensions: [h[i]],
            onChange: n,
            theme: "dark" == A ? c.Ts : o.al,
            basicSetup: { closeBrackets: !0, indentOnInput: !0 },
            style: {
              borderWidth: p ? 1 : 0,
              borderColor: f.palette.divider,
              borderRadius: p ? 4 : 0,
            },
            className: j ? "codemirror-editor-rounded" : "",
            indentWithTab: !0,
          });
        };
    },
    81953: (e, l, a) => {
      a.d(l, { K: () => E });
      var s = a(45903),
        t = a(26240),
        r = a(53193),
        n = a(15795),
        i = a(72221),
        o = a(32143),
        c = a(74050),
        d = a(96446),
        u = a(43845),
        m = a(931),
        x = a(76879),
        h = a(58390),
        p = a(98452),
        y = a(53536),
        j = a(86178),
        f = a.n(j),
        v = a(88739),
        A = a(13733),
        g = a(60184),
        b = a(68903),
        _ = a(25673),
        N = a(17392),
        z = a(65043),
        C = a(45394),
        T = a(70579);
      const q = (e) => {
          let { value: l, onChange: a, onDelete: s, type: r } = e;
          const n = (0, t.A)();
          return (0, T.jsx)(b.Ay, {
            item: !0,
            xs: 6,
            sm: 4,
            md: 4,
            lg: 3,
            xl: 3,
            className: "!p-1",
            children: (0, T.jsxs)("div", {
              style: {
                borderColor: n.palette.divider,
                borderWidth: 1,
                background: n.palette.background.paper,
              },
              className:
                "flex flex-row justify-start items-center rounded px-2 h-[32px]",
              children: [
                (0, T.jsx)(_.Ay, {
                  sx: { flex: 1, "& .MuiInputBase-input": { padding: 0 } },
                  placeholder: "Add value here",
                  className: "!p-0",
                  type: r,
                  value: l,
                  onChange: (e) => {
                    a(e.target.value);
                  },
                }),
                (0, T.jsx)(N.A, {
                  color: "primary",
                  "aria-label": "directions",
                  className: "!p-0",
                  onClick: s,
                  children: (0, T.jsx)(C.$8F, {
                    className: "!text-base",
                    style: { margin: 0 },
                  }),
                }),
              ],
            }),
          });
        },
        S = (e) => {
          let { handleAddValue: l, type: a } = e;
          const s = (0, t.A)(),
            [r, n] = (0, z.useState)("number" == a ? 0 : "");
          return (0, T.jsx)(b.Ay, {
            item: !0,
            xs: 6,
            sm: 4,
            md: 4,
            lg: 3,
            xl: 3,
            className: "!p-1",
            children: (0, T.jsxs)("div", {
              style: {
                borderColor: s.palette.divider,
                borderWidth: 1,
                background: s.palette.background.secondary,
              },
              className:
                "flex flex-row justify-start items-center rounded px-2 h-[32px]",
              children: [
                (0, T.jsx)(_.Ay, {
                  sx: { flex: 1, "& .MuiInputBase-input": { padding: 0 } },
                  placeholder: "Add value here",
                  className: "!p-0",
                  type: a,
                  value: r,
                  onChange: (e) => {
                    n(e.target.value);
                  },
                }),
                (0, T.jsx)(N.A, {
                  color: "primary",
                  "aria-label": "directions",
                  className: "!p-0",
                  onClick: () => l(r),
                  children: (0, T.jsx)(g.OiG, {
                    className: "!text-sm",
                    style: { margin: 0 },
                  }),
                }),
              ],
            }),
          });
        },
        k = (e) => {
          let { value: l, onChange: a, type: s } = e;
          (0, t.A)();
          const r = (e, t) => {
            const r = [...l];
            (r[e] = "number" === s ? parseInt(t) : t), a(r);
          };
          return (0, T.jsxs)(b.Ay, {
            container: !0,
            className: "!w-full !rounded !flex-grow",
            children: [
              Array.isArray(l) &&
                l.map((e, t) =>
                  (0, T.jsx)(q, {
                    value: e,
                    type: s,
                    onChange: (e) => r(t, e),
                    onDelete: () =>
                      ((e) => {
                        const s = [...l];
                        s.splice(e, 1), a(s);
                      })(t),
                  })
                ),
              (0, T.jsx)(S, {
                type: s,
                handleAddValue: (e) => {
                  const t = [...l];
                  t.push("number" === s ? parseInt(e) : e), a(t);
                },
              }),
            ],
          });
        },
        E = (e) => {
          let {
            type: l,
            isList: a,
            onChange: j,
            onBlur: b,
            value: _,
            helperText: N,
            error: z,
            name: C,
            required: q,
            readOnly: S,
            dateTimePicker: E = "normal",
            customMapping: W,
            selectOptions: I,
            setFieldValue: B,
            showDefault: D,
            language: O,
            customLabel: w,
          } = e;
          const R = (0, t.A)(),
            P = (0, s.A)("normal" === E ? m.K : x.I)((e) => {
              let { theme: l } = e;
              return { "& .MuiInputBase-input": { padding: "8.5px 14px" } };
            }),
            L = (0, y.lowerCase)(C);
          let V = null;
          switch (l) {
            case v.a.DATA_TYPES.STRING:
              V = (0, T.jsxs)(r.A, {
                fullWidth: !0,
                className: "!flex !flex-col !justify-start !items-start",
                size: "small",
                children: [
                  w ||
                    (L &&
                      (0, T.jsx)("span", {
                        className: "text-xs font-light mb-1",
                        style: { color: R.palette.text.secondary },
                        children: L,
                      })),
                  (0, T.jsx)(n.A, {
                    disabled: S,
                    required: q,
                    fullWidth: !0,
                    size: "small",
                    variant: "outlined",
                    type: "text",
                    name: C,
                    onChange: j,
                    onBlur: b,
                    value: _,
                    helperText: N,
                    error: z,
                  }),
                ],
              });
              break;
            case v.a.DATA_TYPES.COLOR:
              V = (0, T.jsxs)(r.A, {
                fullWidth: !0,
                className: "!flex !flex-col !justify-start !items-start",
                size: "small",
                children: [
                  w ||
                    (L &&
                      (0, T.jsx)("span", {
                        style: { color: R.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: L,
                      })),
                  (0, T.jsx)(n.A, {
                    disabled: S,
                    required: q,
                    fullWidth: !0,
                    size: "small",
                    variant: "outlined",
                    type: "color",
                    name: C,
                    onChange: j,
                    onBlur: b,
                    value: _,
                    helperText: N,
                    error: z,
                  }),
                ],
              });
              break;
            case v.a.DATA_TYPES.CODE:
              V = (0, T.jsxs)(r.A, {
                fullWidth: !0,
                className: "!flex !flex-col !justify-start !items-start",
                size: "small",
                children: [
                  w ||
                    (L &&
                      (0, T.jsx)("span", {
                        style: { color: R.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: L,
                      })),
                  (0, T.jsx)(A.B, {
                    disabled: S,
                    required: q,
                    fullWidth: !0,
                    size: "small",
                    variant: "outlined",
                    type: "color",
                    name: C,
                    setCode: (e) => {
                      B(C, e ? JSON.parse(e) : e);
                    },
                    onBlur: b,
                    code: _,
                    helperText: N,
                    error: z,
                  }),
                ],
              });
              break;
            case v.a.DATA_TYPES.SINGLE_SELECT:
              V = (0, T.jsxs)(r.A, {
                fullWidth: !0,
                size: "small",
                children: [
                  w ||
                    (L &&
                      (0, T.jsx)("span", {
                        style: { color: R.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: L,
                      })),
                  (0, T.jsx)(i.A, {
                    id: C,
                    value: _,
                    onChange: j,
                    onBlur: b,
                    error: z,
                    name: C,
                    disabled: S,
                    required: q,
                    fullWidth: !0,
                    size: "small",
                    children:
                      null === I || void 0 === I
                        ? void 0
                        : I.map((e) => {
                            const l = (0, y.isNull)(e.value) ? e : e.value,
                              a = e.label ? e.label : l;
                            return (0, T.jsx)(o.A, { value: l, children: a });
                          }),
                  }),
                  z &&
                    (0, T.jsx)("span", {
                      className: "mt-2 text-red-500",
                      children: z,
                    }),
                ],
              });
              break;
            case v.a.DATA_TYPES.MULTIPLE_SELECT:
              V = (0, T.jsxs)(r.A, {
                fullWidth: !0,
                size: "small",
                children: [
                  w ||
                    (L &&
                      (0, T.jsx)("span", {
                        style: { color: R.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: L,
                      })),
                  (0, T.jsx)(i.A, {
                    id: C,
                    multiple: !0,
                    value: _,
                    onChange: j,
                    onBlur: b,
                    error: z,
                    name: C,
                    disabled: S,
                    required: q,
                    fullWidth: !0,
                    size: "small",
                    input: (0, T.jsx)(c.A, {
                      id: "select-multiple-chip",
                      label: "Chip",
                      size: "small",
                    }),
                    renderValue: (e) =>
                      (0, T.jsx)(d.A, {
                        sx: { display: "flex", flexWrap: "wrap", gap: 0.5 },
                        children: e.map((e) =>
                          (0, T.jsx)(
                            u.A,
                            { label: e.label, size: "small", color: "primary" },
                            e.value
                          )
                        ),
                      }),
                    children:
                      null === I || void 0 === I
                        ? void 0
                        : I.map((e) =>
                            (0, T.jsx)(
                              o.A,
                              { value: e, children: e.label },
                              e.value
                            )
                          ),
                  }),
                  z &&
                    (0, T.jsx)("span", {
                      className: "mt-2 text-red-500 font-thin text-xs",
                      children: z,
                    }),
                ],
              });
              break;
            case v.a.DATA_TYPES.BOOLEAN:
              V = (0, T.jsxs)(r.A, {
                fullWidth: !0,
                className: "!flex !flex-col !justify-start !items-start",
                size: "small",
                children: [
                  w ||
                    (L &&
                      (0, T.jsx)("span", {
                        style: { color: R.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: L,
                      })),
                  (0, T.jsxs)(i.A, {
                    id: C,
                    name: C,
                    onChange: j,
                    onBlur: b,
                    value: Boolean(_),
                    error: z,
                    IconComponent: () =>
                      (0, T.jsx)(g.Vr3, { className: "!text-sm" }),
                    className: " !w-full",
                    required: q,
                    disabled: S,
                    children: [
                      (0, T.jsx)(o.A, {
                        value: !0,
                        className: "!break-words !whitespace-pre-line",
                        children: "True",
                      }),
                      (0, T.jsx)(o.A, {
                        value: !1,
                        className: "!break-words !whitespace-pre-line",
                        children: "False",
                      }),
                    ],
                  }),
                ],
              });
              break;
            case v.a.DATA_TYPES.DATETIME:
              V = (0, T.jsxs)(r.A, {
                fullWidth: !0,
                className:
                  "!flex !flex-col !justify-start !items-start !w-full",
                size: "small",
                children: [
                  w ||
                    (L &&
                      (0, T.jsx)("span", {
                        style: { color: R.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: L,
                      })),
                  (0, T.jsx)(h.$, {
                    dateAdapter: p.Y,
                    children: (0, T.jsx)(P, {
                      name: C,
                      onChange: j,
                      onBlur: b,
                      value: _ ? f()(new Date(_)) : null,
                      helperText: N,
                      error: z,
                      className: "!w-full",
                      disabled: S,
                    }),
                  }),
                ],
              });
              break;
            case v.a.DATA_TYPES.JSON:
              V = (0, T.jsxs)(r.A, {
                fullWidth: !0,
                size: "small",
                children: [
                  w ||
                    (L &&
                      (0, T.jsx)("span", {
                        style: { color: R.palette.text.secondary },
                        className: "text-xs font-light mb-1",
                        children: L,
                      })),
                  (0, T.jsx)(A.B, {
                    disabled: S,
                    required: q,
                    fullWidth: !0,
                    size: "small",
                    variant: "outlined",
                    type: "color",
                    name: C,
                    setCode: (e) => {
                      B(C, e ? JSON.parse(e) : e);
                    },
                    language: O || "json",
                    onBlur: b,
                    code:
                      "object" === typeof _ ? JSON.stringify(_, null, 2) : _,
                    helperText: N,
                    error: z,
                  }),
                ],
              });
              break;
            case v.a.DATA_TYPES.INT:
              var F;
              V = a
                ? (0, T.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      w ||
                        (L &&
                          (0, T.jsx)("span", {
                            style: { color: R.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: L,
                          })),
                      (0, T.jsx)(k, {
                        value: _,
                        onChange: (e) => B(C, e),
                        type: "number",
                      }),
                    ],
                  })
                : W
                ? (0, T.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      w ||
                        (L &&
                          (0, T.jsx)("span", {
                            style: { color: R.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: L,
                          })),
                      (0, T.jsx)(i.A, {
                        name: C,
                        onChange: j,
                        onBlur: b,
                        value: parseInt(_),
                        IconComponent: () =>
                          (0, T.jsx)(g.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === (F = Object.keys(W)) || void 0 === F
                            ? void 0
                            : F.map((e, l) =>
                                (0, T.jsx)(
                                  o.A,
                                  {
                                    value: parseInt(e),
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: W[e],
                                  },
                                  l
                                )
                              ),
                      }),
                    ],
                  })
                : (0, T.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      w ||
                        (L &&
                          (0, T.jsx)("span", {
                            style: { color: R.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: L,
                          })),
                      (0, T.jsx)(n.A, {
                        required: q,
                        fullWidth: !0,
                        size: "small",
                        variant: "outlined",
                        type: "number",
                        name: C,
                        onChange: j,
                        onBlur: b,
                        value: _,
                        helperText: N,
                        error: z,
                        disabled: S,
                      }),
                    ],
                  });
              break;
            case v.a.DATA_TYPES.FLOAT:
              var G;
              V = W
                ? (0, T.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      w ||
                        (L &&
                          (0, T.jsx)("span", {
                            style: { color: R.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: L,
                          })),
                      (0, T.jsx)(i.A, {
                        name: C,
                        onChange: j,
                        onBlur: b,
                        value: parseInt(_),
                        IconComponent: () =>
                          (0, T.jsx)(g.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === (G = Object.keys(W)) || void 0 === G
                            ? void 0
                            : G.map((e, l) =>
                                (0, T.jsx)(
                                  o.A,
                                  {
                                    value: parseInt(e),
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: W[e],
                                  },
                                  l
                                )
                              ),
                      }),
                    ],
                  })
                : (0, T.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      w ||
                        (L &&
                          (0, T.jsx)("span", {
                            style: { color: R.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: L,
                          })),
                      (0, T.jsx)(n.A, {
                        required: q,
                        fullWidth: !0,
                        size: "small",
                        variant: "outlined",
                        type: "number",
                        name: C,
                        onChange: j,
                        onBlur: b,
                        value: _,
                        helperText: N,
                        error: z,
                        disabled: S,
                      }),
                    ],
                  });
              break;
            case v.a.DATA_TYPES.DECIMAL:
              var M;
              V = W
                ? (0, T.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      w ||
                        (L &&
                          (0, T.jsx)("span", {
                            style: { color: R.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: L,
                          })),
                      (0, T.jsx)(i.A, {
                        name: C,
                        onChange: j,
                        onBlur: b,
                        value: parseInt(_),
                        IconComponent: () =>
                          (0, T.jsx)(g.Vr3, { className: "!text-sm" }),
                        size: "small",
                        className: "",
                        fullWidth: !0,
                        children:
                          null === (M = Object.keys(W)) || void 0 === M
                            ? void 0
                            : M.map((e, l) =>
                                (0, T.jsx)(
                                  o.A,
                                  {
                                    value: parseInt(e),
                                    className:
                                      "!break-words !whitespace-pre-line",
                                    children: W[e],
                                  },
                                  l
                                )
                              ),
                      }),
                    ],
                  })
                : (0, T.jsxs)(r.A, {
                    fullWidth: !0,
                    className: "!flex !flex-col !justify-start !items-start",
                    size: "small",
                    children: [
                      w ||
                        (L &&
                          (0, T.jsx)("span", {
                            style: { color: R.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: L,
                          })),
                      (0, T.jsx)(n.A, {
                        required: q,
                        fullWidth: !0,
                        size: "small",
                        variant: "outlined",
                        type: "number",
                        name: C,
                        onChange: j,
                        onBlur: b,
                        value: _,
                        helperText: N,
                        error: z,
                        disabled: S,
                      }),
                    ],
                  });
              break;
            default:
              V = D
                ? (0, T.jsxs)(r.A, {
                    fullWidth: !0,
                    size: "small",
                    children: [
                      w ||
                        (L &&
                          (0, T.jsx)("span", {
                            style: { color: R.palette.text.secondary },
                            className: "text-xs font-light mb-1",
                            children: L,
                          })),
                      (0, T.jsx)(A.B, {
                        disabled: S,
                        required: q,
                        fullWidth: !0,
                        size: "small",
                        variant: "outlined",
                        type: "color",
                        name: C,
                        setCode: (e) => {
                          B(C, e ? JSON.parse(e) : e);
                        },
                        language: O || "json",
                        onBlur: b,
                        code:
                          "object" === typeof _
                            ? JSON.stringify(_, null, 2)
                            : _,
                        helperText: N,
                        error: z,
                      }),
                    ],
                  })
                : null;
          }
          return V;
        };
    },
    11068: (e, l, a) => {
      a.d(l, { U: () => i });
      var s = a(26240),
        t = a(68903),
        r = (a(65043), a(97054)),
        n = a(70579);
      const i = (e) => {
        let {
          graphType: l,
          legendPosition: a,
          titleDisplayEnabled: i,
          graphTitle: o,
          data: c,
          refetchInterval: d,
        } = e;
        const u = (0, s.A)();
        return (0, n.jsx)("div", {
          className: "!pt-10  !sticky !top-0 !z-50",
          children: (0, n.jsx)(t.Ay, {
            container: !0,
            rowSpacing: 2,
            className: "rounded !p-3",
            style: {
              background: u.palette.background.secondary,
              borderColor: u.palette.divider,
              borderWidth: 1,
            },
            children: r.z[l].component({
              legendPosition: a,
              titleDisplayEnabled: i,
              graphTitle: o,
              data: c,
            }),
          }),
        });
      };
    },
    73752: (e, l, a) => {
      a.d(l, { c: () => B });
      var s = a(26240),
        t = a(68903),
        r = a(53193),
        n = a(15795),
        i = a(68577),
        o = a(51962),
        c = a(72221),
        d = a(32143),
        u = a(42518),
        m = a(17392),
        x = a(38968),
        h = a(2050),
        p = a(48734),
        y = a(93747),
        j = a(65043),
        f = a(60184),
        v = a(35113),
        A = a(88739),
        g = a(97054),
        b = a(83359),
        _ = (a(81953), a(35475)),
        N = a(17160),
        z = a(63248),
        C = a(47097),
        T = a(76639),
        q = a(56249),
        S = a(45394),
        k = a(77769),
        E = a(73216),
        W = a(70579);
      const I = (e) => {
          let { pmGraphID: l } = e;
          const { pmUser: a } = (0, N.hD)(),
            s = (0, E.Zp)(),
            t = (0, z.jE)(),
            [r, n] = (0, j.useState)(!1),
            i = (0, j.useMemo)(
              () => !!a && a.isAuthorizedToDeleteGraph(l),
              [a, l]
            ),
            {
              isPending: o,
              isSuccess: c,
              isError: d,
              error: m,
              mutate: x,
            } = (0, C.n)({
              mutationFn: () => (0, k.iL)({ pmGraphID: l }),
              retry: !1,
              onSuccess: () => {
                (0, T.qq)(A.a.STRINGS.GRAPH_DELETED_SUCCESS),
                  n(!1),
                  s(A.a.ROUTES.ALL_GRAPHS.path()),
                  t.invalidateQueries([A.a.REACT_QUERY_KEYS.GRAPHS]);
              },
              onError: (e) => {
                (0, T.jx)(e);
              },
            });
          return (
            i &&
            (0, W.jsxs)(W.Fragment, {
              children: [
                (0, W.jsx)(u.A, {
                  onClick: () => {
                    n(!0);
                  },
                  startIcon: (0, W.jsx)(S.tW_, { className: "!text-sm" }),
                  size: "medium",
                  variant: "outlined",
                  className: "!ml-2",
                  color: "error",
                  children: A.a.STRINGS.DELETE_BUTTON_TEXT,
                }),
                (0, W.jsx)(q.K, {
                  open: r,
                  onAccepted: () => {
                    x({ pmGraphID: l });
                  },
                  onDecline: () => {
                    n(!1);
                  },
                  title: A.a.STRINGS.GRAPH_DELETION_CONFIRMATION_TITLE,
                  message: ""
                    .concat(A.a.STRINGS.GRAPH_DELETION_CONFIRMATION_BODY, " - ")
                    .concat(l),
                }),
              ],
            })
          );
        },
        B = (e) => {
          var l;
          let { pmGraphID: a, graphForm: j } = e;
          const N = (0, s.A)(),
            {
              isLoading: z,
              data: C,
              error: T,
              refetch: q,
            } = (0, y.I)({
              queryKey: [A.a.REACT_QUERY_KEYS.QUERIES],
              queryFn: () => (0, v.Q2)(),
              cacheTime: 0,
              retry: 1,
              staleTime: 0,
            });
          return (0, W.jsx)("form", {
            onSubmit: j.handleSubmit,
            className: "!pt-3",
            children: (0, W.jsxs)(t.Ay, {
              container: !0,
              spacing: 2,
              className: "rounded !p-3",
              children: [
                (0, W.jsx)(
                  t.Ay,
                  {
                    item: !0,
                    xs: 12,
                    sm: 12,
                    md: 12,
                    lg: 12,
                    children: (0, W.jsxs)(r.A, {
                      fullWidth: !0,
                      size: "small",
                      className: "",
                      children: [
                        (0, W.jsx)("span", {
                          className: "text-xs font-light  !capitalize mb-1",
                          children: "Title",
                        }),
                        (0, W.jsx)(n.A, {
                          required: !0,
                          fullWidth: !0,
                          size: "small",
                          variant: "outlined",
                          type: "text",
                          name: "graph_title",
                          value: j.values.graph_title,
                          onChange: j.handleChange,
                          onBlur: j.handleBlur,
                        }),
                      ],
                    }),
                  },
                  "graph_title"
                ),
                (0, W.jsx)(
                  t.Ay,
                  {
                    item: !0,
                    xs: 12,
                    sm: 12,
                    md: 12,
                    lg: 12,
                    children: (0, W.jsx)(i.A, {
                      control: (0, W.jsx)(o.A, {
                        checked: j.values.title_display_enabled,
                      }),
                      label: "Title visible",
                      name: "title_display_enabled",
                      onChange: j.handleChange,
                      onBlur: j.handleBlur,
                    }),
                  },
                  "title_display_enabled"
                ),
                (0, W.jsx)(
                  t.Ay,
                  {
                    item: !0,
                    xs: 12,
                    sm: 12,
                    md: 12,
                    lg: 12,
                    children: (0, W.jsxs)(r.A, {
                      fullWidth: !0,
                      size: "small",
                      className: "",
                      children: [
                        (0, W.jsx)("span", {
                          className: "text-xs font-light  !capitalize mb-1",
                          children: "Legend position",
                        }),
                        (0, W.jsx)(c.A, {
                          value: j.values.legend_position,
                          onChange: j.handleChange,
                          onBlur: j.handleBlur,
                          name: "legend_position",
                          required: !0,
                          size: "small",
                          fullWidth: !1,
                          children: Object.keys(A.a.GRAPH_LEGEND_POSITION).map(
                            (e) =>
                              (0, W.jsx)(d.A, {
                                value: A.a.GRAPH_LEGEND_POSITION[e],
                                children: e,
                              })
                          ),
                        }),
                      ],
                    }),
                  },
                  "legend_position"
                ),
                (0, W.jsx)(
                  t.Ay,
                  {
                    item: !0,
                    xs: 12,
                    sm: 12,
                    md: 12,
                    lg: 12,
                    children: (0, W.jsxs)(r.A, {
                      fullWidth: !0,
                      size: "small",
                      className: "",
                      children: [
                        (0, W.jsx)("span", {
                          className: "text-xs font-light  !capitalize mb-1",
                          children: "Graph type",
                        }),
                        (0, W.jsx)(c.A, {
                          value: j.values.graph_type,
                          onChange: j.handleChange,
                          onBlur: j.handleBlur,
                          name: "graph_type",
                          required: !0,
                          size: "small",
                          fullWidth: !1,
                          children: Object.keys(g.z).map((e) =>
                            (0, W.jsx)(d.A, {
                              value: g.z[e].value,
                              children: g.z[e].label,
                            })
                          ),
                        }),
                      ],
                    }),
                  },
                  "graph_type"
                ),
                (0, W.jsx)(
                  t.Ay,
                  {
                    item: !0,
                    xs: 12,
                    sm: 12,
                    md: 12,
                    lg: 12,
                    children: (0, W.jsxs)(r.A, {
                      fullWidth: !0,
                      size: "small",
                      className: "",
                      children: [
                        (0, W.jsx)("span", {
                          className: "text-xs font-light  !capitalize mb-1",
                          children: "Refetch interval (in seconds)",
                        }),
                        (0, W.jsx)(n.A, {
                          required: !0,
                          fullWidth: !0,
                          size: "small",
                          variant: "outlined",
                          type: "number",
                          name: "refetch_interval",
                          value: j.values.refetch_interval,
                          onChange: j.handleChange,
                          onBlur: j.handleBlur,
                        }),
                      ],
                    }),
                  },
                  "refetch_interval"
                ),
                (0, W.jsx)(
                  t.Ay,
                  {
                    item: !0,
                    xs: 12,
                    sm: 12,
                    md: 12,
                    lg: 12,
                    children: (0, W.jsx)(u.A, {
                      variant: "contained",
                      onClick: () => {
                        const e = j.values.query_array;
                        j.setFieldValue("query_array", [
                          ...e,
                          { dataset_title: "", color: "#D84545", query: "" },
                        ]);
                      },
                      children: "Add dataset",
                    }),
                  },
                  "query_array"
                ),
                C && C.length > 0
                  ? null === (l = j.values.query_array) || void 0 === l
                    ? void 0
                    : l.map((e, l) => {
                        var a, s, i, o, u, x, h, p, y, v;
                        return (0, W.jsxs)(t.Ay, {
                          className: "!rounded  !mt-3 !ml-3.5 !pr-3 !py-3",
                          sx: {
                            background: N.palette.background.secondary,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: N.palette.divider,
                          },
                          rowSpacing: 2,
                          columnSpacing: 2,
                          container: !0,
                          xs: 12,
                          sm: 12,
                          md: 12,
                          lg: 12,
                          children: [
                            (0, W.jsx)(
                              t.Ay,
                              {
                                item: !0,
                                xs: 12,
                                sm: 12,
                                md: 12,
                                lg: 12,
                                className: "!flex justify-end !-mt-3",
                                children: (0, W.jsx)(m.A, {
                                  "aria-label": "delete",
                                  color: "error",
                                  className: "!p-0",
                                  onClick: () =>
                                    ((e) => {
                                      let l = j.values.query_array;
                                      l.splice(e, 1),
                                        j.setFieldValue("query_array", l);
                                    })(l),
                                  children: (0, W.jsx)(f.QCr, {
                                    className: "!text-sm",
                                  }),
                                }),
                              },
                              "query_array"
                            ),
                            (0, W.jsxs)(
                              t.Ay,
                              {
                                item: !0,
                                xs: 12,
                                sm: 12,
                                md: 12,
                                lg: 12,
                                children: [
                                  (null === (a = g.z[j.values.graph_type]) ||
                                  void 0 === a ||
                                  null === (s = a.fields) ||
                                  void 0 === s
                                    ? void 0
                                    : s.includes("dataset_title")) &&
                                    (0, W.jsx)(
                                      t.Ay,
                                      {
                                        item: !0,
                                        xs: 12,
                                        sm: 12,
                                        md: 12,
                                        lg: 12,
                                        children: (0, W.jsxs)(r.A, {
                                          fullWidth: !0,
                                          size: "small",
                                          className: "",
                                          children: [
                                            (0, W.jsx)("span", {
                                              className:
                                                "text-xs font-light  !capitalize mb-1",
                                              children: "Dataset title",
                                            }),
                                            (0, W.jsx)(n.A, {
                                              required: !0,
                                              fullWidth: !0,
                                              size: "small",
                                              variant: "outlined",
                                              type: "text",
                                              name: "query_array_x-".concat(l),
                                              value: e.dataset_title,
                                              onBlur: j.handleBlur,
                                              onChange: (e) => {
                                                ((e, l) => {
                                                  let a = j.values.query_array;
                                                  (a[e].dataset_title = l),
                                                    j.setFieldValue(
                                                      "query_array",
                                                      a
                                                    );
                                                })(l, e.target.value);
                                              },
                                            }),
                                          ],
                                        }),
                                      },
                                      "query_array_dataset_title-".concat(l)
                                    ),
                                  (0, W.jsxs)(r.A, {
                                    fullWidth: !0,
                                    size: "small",
                                    className: "!mt-3",
                                    children: [
                                      (0, W.jsx)("span", {
                                        className:
                                          "text-xs font-light  !capitalize mb-1",
                                        children: "Select query",
                                      }),
                                      (0, W.jsx)(c.A, {
                                        name: "query_array_query-".concat(l),
                                        value: parseInt(e.pm_query_id),
                                        onBlur: j.handleBlur,
                                        onChange: (e) => {
                                          ((e, l) => {
                                            let a = j.values.query_array;
                                            (a[e].pm_query_id = l),
                                              j.setFieldValue("query_array", a);
                                          })(l, e.target.value);
                                        },
                                        required: !0,
                                        size: "small",
                                        fullWidth: !0,
                                        children:
                                          null === C || void 0 === C
                                            ? void 0
                                            : C.map(
                                                (e) => (
                                                  console.log({ query: e }),
                                                  (0, W.jsx)(d.A, {
                                                    value: e.pm_query_id,
                                                    children: (0, W.jsxs)(
                                                      "div",
                                                      {
                                                        className:
                                                          "!flex flex-row justify-start items-center",
                                                        children: [
                                                          b.R[e.pm_query_type]
                                                            .icon,
                                                          (0, W.jsx)("span", {
                                                            className: "ml-2",
                                                            children:
                                                              e.pm_query_title,
                                                          }),
                                                        ],
                                                      }
                                                    ),
                                                  })
                                                )
                                              ),
                                      }),
                                    ],
                                  }),
                                ],
                              },
                              "query_array_title-".concat(l)
                            ),
                            (null === (i = g.z[j.values.graph_type]) ||
                            void 0 === i ||
                            null === (o = i.fields) ||
                            void 0 === o
                              ? void 0
                              : o.includes("label")) &&
                              (0, W.jsx)(
                                t.Ay,
                                {
                                  item: !0,
                                  xs: 6,
                                  sm: 6,
                                  md: 4,
                                  lg: 4,
                                  children: (0, W.jsxs)(r.A, {
                                    fullWidth: !0,
                                    size: "small",
                                    className: "",
                                    children: [
                                      (0, W.jsx)("span", {
                                        className:
                                          "text-xs font-light  !capitalize mb-1",
                                        children: "label",
                                      }),
                                      (0, W.jsx)(n.A, {
                                        required: !0,
                                        fullWidth: !0,
                                        size: "small",
                                        variant: "outlined",
                                        type: "text",
                                        name: "query_array_label-".concat(l),
                                        value: e.label,
                                        onBlur: j.handleBlur,
                                        onChange: (e) => {
                                          ((e, l) => {
                                            let a = j.values.query_array;
                                            (a[e].label = l),
                                              j.setFieldValue("query_array", a);
                                          })(l, e.target.value);
                                        },
                                      }),
                                    ],
                                  }),
                                },
                                "query_array_label-".concat(l)
                              ),
                            (null === (u = g.z[j.values.graph_type]) ||
                            void 0 === u ||
                            null === (x = u.fields) ||
                            void 0 === x
                              ? void 0
                              : x.includes("x_axis")) &&
                              (0, W.jsx)(
                                t.Ay,
                                {
                                  item: !0,
                                  xs: 6,
                                  sm: 6,
                                  md: 4,
                                  lg: 4,
                                  children: (0, W.jsxs)(r.A, {
                                    fullWidth: !0,
                                    size: "small",
                                    className: "",
                                    children: [
                                      (0, W.jsx)("span", {
                                        className:
                                          "text-xs font-light  !capitalize mb-1",
                                        children: "x-axis",
                                      }),
                                      (0, W.jsx)(n.A, {
                                        required: !0,
                                        fullWidth: !0,
                                        size: "small",
                                        variant: "outlined",
                                        type: "text",
                                        name: "query_array_x-".concat(l),
                                        value: e.x_axis,
                                        onBlur: j.handleBlur,
                                        onChange: (e) => {
                                          ((e, l) => {
                                            let a = j.values.query_array;
                                            (a[e].x_axis = l),
                                              j.setFieldValue("query_array", a);
                                          })(l, e.target.value);
                                        },
                                      }),
                                    ],
                                  }),
                                },
                                "query_array_x-".concat(l)
                              ),
                            (null === (h = g.z[j.values.graph_type]) ||
                            void 0 === h ||
                            null === (p = h.fields) ||
                            void 0 === p
                              ? void 0
                              : p.includes("y_axis")) &&
                              (0, W.jsx)(
                                t.Ay,
                                {
                                  item: !0,
                                  xs: 6,
                                  sm: 6,
                                  md: 4,
                                  lg: 4,
                                  children: (0, W.jsxs)(r.A, {
                                    fullWidth: !0,
                                    size: "small",
                                    className: "",
                                    children: [
                                      (0, W.jsx)("span", {
                                        className:
                                          "text-xs font-light  !capitalize mb-1",
                                        children: "y-axis",
                                      }),
                                      (0, W.jsx)(n.A, {
                                        required: !0,
                                        fullWidth: !0,
                                        size: "small",
                                        variant: "outlined",
                                        type: "text",
                                        name: "query_array_y-".concat(l),
                                        value: e.y_axis,
                                        onBlur: j.handleBlur,
                                        onChange: (e) => {
                                          ((e, l) => {
                                            let a = j.values.query_array;
                                            (a[e].y_axis = l),
                                              j.setFieldValue("query_array", a);
                                          })(l, e.target.value);
                                        },
                                      }),
                                    ],
                                  }),
                                },
                                "query_array_y-".concat(l)
                              ),
                            (null === (y = g.z[j.values.graph_type]) ||
                            void 0 === y ||
                            null === (v = y.fields) ||
                            void 0 === v
                              ? void 0
                              : v.includes("value")) &&
                              (0, W.jsx)(
                                t.Ay,
                                {
                                  item: !0,
                                  xs: 6,
                                  sm: 6,
                                  md: 4,
                                  lg: 4,
                                  children: (0, W.jsxs)(r.A, {
                                    fullWidth: !0,
                                    size: "small",
                                    className: "",
                                    children: [
                                      (0, W.jsx)("span", {
                                        className:
                                          "text-xs font-light  !capitalize mb-1",
                                        children: "value",
                                      }),
                                      (0, W.jsx)(n.A, {
                                        required: !0,
                                        fullWidth: !0,
                                        size: "small",
                                        variant: "outlined",
                                        type: "text",
                                        name: "query_array_value-".concat(l),
                                        value: e.value,
                                        onBlur: j.handleBlur,
                                        onChange: (e) => {
                                          ((e, l) => {
                                            let a = j.values.query_array;
                                            (a[e].value = l),
                                              j.setFieldValue("query_array", a);
                                          })(l, e.target.value);
                                        },
                                      }),
                                    ],
                                  }),
                                },
                                "query_array_value-".concat(l)
                              ),
                            (0, W.jsx)(
                              t.Ay,
                              {
                                item: !0,
                                xs: 12,
                                sm: 12,
                                md: 4,
                                lg: 4,
                                children: (0, W.jsxs)(r.A, {
                                  fullWidth: !0,
                                  size: "small",
                                  className: "",
                                  children: [
                                    (0, W.jsx)("span", {
                                      className:
                                        "text-xs font-light  !capitalize mb-1",
                                      children: "color",
                                    }),
                                    (0, W.jsx)(n.A, {
                                      required: !0,
                                      fullWidth: !0,
                                      size: "small",
                                      variant: "outlined",
                                      type: "color",
                                      name: "query_array_color-".concat(l),
                                      value: e.color,
                                      onBlur: j.handleBlur,
                                      onChange: (e) => {
                                        ((e, l) => {
                                          let a = j.values.query_array;
                                          (a[e].color = l),
                                            (a[e].backgroundColor = "".concat(
                                              l,
                                              "80"
                                            )),
                                            j.setFieldValue("query_array", a);
                                        })(l, e.target.value);
                                      },
                                    }),
                                  ],
                                }),
                              },
                              "query_array_color-".concat(l)
                            ),
                          ],
                        });
                      })
                  : (0, W.jsx)(t.Ay, {
                      className: "!rounded  !mt-3 !ml-3.5 !pr-3 !py-3",
                      sx: { background: N.palette.background.default },
                      rowSpacing: 2,
                      columnSpacing: 2,
                      container: !0,
                      xs: 12,
                      sm: 12,
                      md: 12,
                      lg: 12,
                      children: (0, W.jsx)(_.N_, {
                        to: "../../"
                          .concat(A.a.ROUTES.ALL_QUERIES.path(), "/")
                          .concat(A.a.ROUTES.ADD_QUERY.path()),
                        children: (0, W.jsxs)(x.A, {
                          sx: {
                            background: N.palette.background.default,
                            border: "1px dotted",
                            borderColor: N.palette.info.main,
                            borderWidth: 2,
                            marginTop: 1,
                          },
                          className:
                            "!rounded  !flex !flex-row !justify-between !items-center !w-full",
                          children: [
                            (0, W.jsx)(h.A, {
                              sx: { color: N.palette.primary.contrastText },
                              children: (0, W.jsx)(f.OiG, {
                                className: "!text-sm",
                              }),
                            }),
                            (0, W.jsx)(p.A, {
                              sx: { color: N.palette.primary.contrastText },
                              primary:
                                "No queries found. Configure queries to add them as datasets of graph",
                              primaryTypographyProps: {
                                sx: { marginLeft: -2 },
                              },
                            }),
                          ],
                        }),
                      }),
                    }),
                (0, W.jsxs)(
                  t.Ay,
                  {
                    item: !0,
                    xs: 12,
                    sm: 12,
                    md: 12,
                    lg: 12,
                    children: [
                      (0, W.jsx)(u.A, {
                        variant: "contained",
                        onClick: () => {
                          j.handleSubmit();
                        },
                        children: A.a.STRINGS.ADD_BUTTON_TEXT,
                      }),
                      (null != a || void 0 != a) &&
                        (0, W.jsx)(I, { pmGraphID: a }),
                    ],
                  },
                  "submit"
                ),
              ],
            }),
          });
        };
    },
    51962: (e, l, a) => {
      a.d(l, { A: () => q });
      var s = a(98587),
        t = a(58168),
        r = a(65043),
        n = a(58387),
        i = a(68606),
        o = a(67266),
        c = a(33064),
        d = a(59662),
        u = a(70579);
      const m = (0, d.A)(
          (0, u.jsx)("path", {
            d: "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
          }),
          "CheckBoxOutlineBlank"
        ),
        x = (0, d.A)(
          (0, u.jsx)("path", {
            d: "M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
          }),
          "CheckBox"
        ),
        h = (0, d.A)(
          (0, u.jsx)("path", {
            d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z",
          }),
          "IndeterminateCheckBox"
        );
      var p = a(6803),
        y = a(98206),
        j = a(34535),
        f = a(61475),
        v = a(57056),
        A = a(32400);
      function g(e) {
        return (0, A.Ay)("MuiCheckbox", e);
      }
      const b = (0, v.A)("MuiCheckbox", [
          "root",
          "checked",
          "disabled",
          "indeterminate",
          "colorPrimary",
          "colorSecondary",
          "sizeSmall",
          "sizeMedium",
        ]),
        _ = [
          "checkedIcon",
          "color",
          "icon",
          "indeterminate",
          "indeterminateIcon",
          "inputProps",
          "size",
          "className",
        ],
        N = (0, j.Ay)(c.A, {
          shouldForwardProp: (e) => (0, f.A)(e) || "classes" === e,
          name: "MuiCheckbox",
          slot: "Root",
          overridesResolver: (e, l) => {
            const { ownerState: a } = e;
            return [
              l.root,
              a.indeterminate && l.indeterminate,
              l["size".concat((0, p.A)(a.size))],
              "default" !== a.color && l["color".concat((0, p.A)(a.color))],
            ];
          },
        })((e) => {
          let { theme: l, ownerState: a } = e;
          return (0, t.A)(
            { color: (l.vars || l).palette.text.secondary },
            !a.disableRipple && {
              "&:hover": {
                backgroundColor: l.vars
                  ? "rgba("
                      .concat(
                        "default" === a.color
                          ? l.vars.palette.action.activeChannel
                          : l.vars.palette[a.color].mainChannel,
                        " / "
                      )
                      .concat(l.vars.palette.action.hoverOpacity, ")")
                  : (0, o.X4)(
                      "default" === a.color
                        ? l.palette.action.active
                        : l.palette[a.color].main,
                      l.palette.action.hoverOpacity
                    ),
                "@media (hover: none)": { backgroundColor: "transparent" },
              },
            },
            "default" !== a.color && {
              ["&.".concat(b.checked, ", &.").concat(b.indeterminate)]: {
                color: (l.vars || l).palette[a.color].main,
              },
              ["&.".concat(b.disabled)]: {
                color: (l.vars || l).palette.action.disabled,
              },
            }
          );
        }),
        z = (0, u.jsx)(x, {}),
        C = (0, u.jsx)(m, {}),
        T = (0, u.jsx)(h, {}),
        q = r.forwardRef(function (e, l) {
          var a, o;
          const c = (0, y.b)({ props: e, name: "MuiCheckbox" }),
            {
              checkedIcon: d = z,
              color: m = "primary",
              icon: x = C,
              indeterminate: h = !1,
              indeterminateIcon: j = T,
              inputProps: f,
              size: v = "medium",
              className: A,
            } = c,
            b = (0, s.A)(c, _),
            q = h ? j : x,
            S = h ? j : d,
            k = (0, t.A)({}, c, { color: m, indeterminate: h, size: v }),
            E = ((e) => {
              const { classes: l, indeterminate: a, color: s, size: r } = e,
                n = {
                  root: [
                    "root",
                    a && "indeterminate",
                    "color".concat((0, p.A)(s)),
                    "size".concat((0, p.A)(r)),
                  ],
                },
                o = (0, i.A)(n, g, l);
              return (0, t.A)({}, l, o);
            })(k);
          return (0,
          u.jsx)(N, (0, t.A)({ type: "checkbox", inputProps: (0, t.A)({ "data-indeterminate": h }, f), icon: r.cloneElement(q, { fontSize: null != (a = q.props.fontSize) ? a : v }), checkedIcon: r.cloneElement(S, { fontSize: null != (o = S.props.fontSize) ? o : v }), ownerState: k, ref: l, className: (0, n.A)(E.root, A) }, b, { classes: E }));
        });
    },
    26600: (e, l, a) => {
      a.d(l, { A: () => y });
      var s = a(58168),
        t = a(98587),
        r = a(65043),
        n = a(58387),
        i = a(68606),
        o = a(85865),
        c = a(34535),
        d = a(98206),
        u = a(87034),
        m = a(2563),
        x = a(70579);
      const h = ["className", "id"],
        p = (0, c.Ay)(o.A, {
          name: "MuiDialogTitle",
          slot: "Root",
          overridesResolver: (e, l) => l.root,
        })({ padding: "16px 24px", flex: "0 0 auto" }),
        y = r.forwardRef(function (e, l) {
          const a = (0, d.b)({ props: e, name: "MuiDialogTitle" }),
            { className: o, id: c } = a,
            y = (0, t.A)(a, h),
            j = a,
            f = ((e) => {
              const { classes: l } = e;
              return (0, i.A)({ root: ["root"] }, u.t, l);
            })(j),
            { titleId: v = c } = r.useContext(m.A);
          return (0,
          x.jsx)(p, (0, s.A)({ component: "h2", className: (0, n.A)(f.root, o), ownerState: j, ref: l, variant: "h6", id: null != c ? c : v }, y));
        });
    },
  },
]);
//# sourceMappingURL=1034.55e21be1.chunk.js.map
