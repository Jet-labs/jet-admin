/**
 * Add beautiful complex Vega chart to Pagila Film Catalog page.
 * Idempotent: reuses existing query/widget when titles match, updates them.
 *
 * Adds:
 *  - Data query "Pagila \u2014 Catalog Landscape (chart)" (rich per-film rows)
 *  - Widget "Catalog Landscape \u2014 Length, Price & Cast" (vega-lite):
 *      heatmap (category x rating) + avg-rate bars + bubble scatter
 *      (runtime vs price, size = cast) + brush-linked runtime histogram,
 *      with rating dropdown + min-cast slider.
 *  - Attaches both to the "Pagila Film Catalog" app page (query alias
 *    "catalog_landscape", full-width row near the top of the layout).
 *
 * The spec was verified headlessly: vega-lite compiles it and vega renders
 * 1000 real rows to SVG. NOTE: legend-bound params and multi-layer brush
 * selections were deliberately avoided \u2014 they produce duplicate-signal
 * runtime errors ("Duplicate signal name") that leave the widget blank.
 *
 * Usage:
 *   cd apps/backend
 *   node scripts/seed-pagila-landscape-chart.js [tenantID] [userID]
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { prisma } = require('../config/prisma.config');
const { dataQueryService } = require('../modules/dataQuery/dataQuery.service');
const { widgetService } = require('../modules/widget/widget.service');

const TENANT_ID = process.argv[2] || '97ca7876-7c73-4578-bccb-6d56b98a0113';
const USER_ID = process.argv[3] || '1a3ece78-45ae-4a19-8475-3e443e2b01e8';
const AUTH = { authType: 'USER', userID: USER_ID };
const PAGE_TITLE = 'Pagila Film Catalog';
const DATASOURCE_TITLE = 'PagilaDB';
const QUERY_TITLE = 'Pagila \u2014 Catalog Landscape (chart)';
const WIDGET_TITLE = 'Catalog Landscape \u2014 Length, Price & Cast';
const WIDGET_DESC = 'Interactive Catalog Landscape: heatmap + value bars + bubble scatter + brush-linked histogram. Rating dropdown + cast slider filter every view.';
const QUERY_ALIAS = 'catalog_landscape';

const LANDSCAPE_SQL = `SELECT f.film_id, f.title, f.release_year, f.rating::text AS rating, COALESCE(c.name, 'Uncategorised') AS category, TRIM(l.name) AS language, f.length, f.rental_rate::float AS rental_rate, f.replacement_cost::float AS replacement_cost, f.rental_duration, COALESCE(ac.actor_count, 0)::int AS actor_count, CASE WHEN f.length < 60 THEN 'Short (<60m)' WHEN f.length < 90 THEN 'Medium (60-89m)' WHEN f.length < 120 THEN 'Long (90-119m)' ELSE 'Epic (120m+)' END AS length_bucket FROM film f LEFT JOIN film_category fc ON fc.film_id = f.film_id LEFT JOIN category c ON c.category_id = fc.category_id JOIN language l ON l.language_id = f.language_id LEFT JOIN (SELECT film_id, COUNT(*) AS actor_count FROM film_actor GROUP BY film_id) ac ON ac.film_id = f.film_id ORDER BY f.length;`;

const LANDSCAPE_SPEC = {
  "data": {
    "values": "{{ state.queries.catalog_landscape.data }}"
  },
  "title": {
    "text": "Catalog Landscape — Length, Price & Cast",
    "anchor": "start",
    "offset": 12,
    "fontSize": 16,
    "subtitle": "1,000 films • brush the scatter to filter the histogram • pick a rating • slide min cast",
    "subtitleColor": "#6b7280",
    "subtitleFontSize": 12
  },
  "width": "container",
  "config": {
    "axis": {
      "grid": true,
      "gridOpacity": 0.25,
      "labelFontSize": 11,
      "titleFontSize": 12
    },
    "view": {
      "stroke": "transparent"
    },
    "range": {
      "category": {
        "scheme": "tableau10"
      }
    },
    "title": {
      "anchor": "start",
      "fontSize": 13
    },
    "legend": {
      "labelFontSize": 11,
      "titleFontSize": 12
    },
    "background": "transparent"
  },
  "params": [
    {
      "bind": {
        "max": 10,
        "min": 0,
        "name": "Min cast size ",
        "step": 1,
        "input": "range"
      },
      "name": "minCast",
      "value": 0
    },
    {
      "bind": {
        "name": "Rating ",
        "input": "select",
        "options": [
          "All",
          "G",
          "PG",
          "PG-13",
          "R",
          "NC-17"
        ]
      },
      "name": "ratingPick",
      "value": "All"
    }
  ],
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "resolve": {
    "scale": {
      "size": "independent",
      "color": "independent"
    }
  },
  "vconcat": [
    {
      "hconcat": [
        {
          "layer": [
            {
              "mark": {
                "type": "rect",
                "tooltip": true,
                "cornerRadius": 3
              },
              "encoding": {
                "x": {
                  "axis": {
                    "labelAngle": 0
                  },
                  "sort": [
                    "G",
                    "PG",
                    "PG-13",
                    "R",
                    "NC-17"
                  ],
                  "type": "nominal",
                  "field": "rating",
                  "title": null
                },
                "y": {
                  "sort": {
                    "op": "count",
                    "order": "descending"
                  },
                  "type": "nominal",
                  "field": "category",
                  "title": null
                },
                "color": {
                  "type": "quantitative",
                  "scale": {
                    "scheme": "blues"
                  },
                  "title": "Films",
                  "legend": {
                    "orient": "right",
                    "titleOrient": "left"
                  },
                  "aggregate": "count"
                },
                "tooltip": [
                  {
                    "type": "nominal",
                    "field": "category",
                    "title": "Category"
                  },
                  {
                    "type": "nominal",
                    "field": "rating",
                    "title": "Rating"
                  },
                  {
                    "type": "quantitative",
                    "title": "Films",
                    "format": ",",
                    "aggregate": "count"
                  },
                  {
                    "type": "quantitative",
                    "field": "rental_rate",
                    "title": "Avg rate",
                    "format": "$.2f",
                    "aggregate": "mean"
                  },
                  {
                    "type": "quantitative",
                    "field": "length",
                    "title": "Avg length",
                    "format": ".1f",
                    "aggregate": "mean"
                  }
                ]
              }
            },
            {
              "mark": {
                "type": "text",
                "fontSize": 10,
                "fontWeight": 600
              },
              "encoding": {
                "x": {
                  "sort": [
                    "G",
                    "PG",
                    "PG-13",
                    "R",
                    "NC-17"
                  ],
                  "type": "nominal",
                  "field": "rating"
                },
                "y": {
                  "sort": {
                    "op": "count",
                    "order": "descending"
                  },
                  "type": "nominal",
                  "field": "category"
                },
                "text": {
                  "type": "quantitative",
                  "format": "d",
                  "aggregate": "count"
                },
                "color": {
                  "value": "#1e3a5f",
                  "condition": {
                    "test": "datum['__count'] > 12",
                    "value": "white"
                  }
                }
              }
            }
          ],
          "title": {
            "text": "Density: films by category × rating",
            "anchor": "start",
            "fontSize": 13
          },
          "height": 250,
          "transform": [
            {
              "filter": "datum.actor_count >= minCast"
            },
            {
              "filter": "ratingPick == 'All' || datum.rating == ratingPick"
            }
          ]
        },
        {
          "layer": [
            {
              "mark": {
                "type": "bar",
                "tooltip": true,
                "cornerRadiusEnd": 4
              },
              "encoding": {
                "x": {
                  "axis": {
                    "format": "$.2f"
                  },
                  "type": "quantitative",
                  "field": "rental_rate",
                  "title": "Avg rental rate ($)",
                  "aggregate": "mean"
                },
                "y": {
                  "sort": {
                    "op": "mean",
                    "field": "rental_rate",
                    "order": "descending"
                  },
                  "type": "nominal",
                  "field": "category",
                  "title": null
                },
                "color": {
                  "type": "quantitative",
                  "field": "rental_rate",
                  "scale": {
                    "scheme": "oranges"
                  },
                  "title": "Avg $",
                  "legend": null,
                  "aggregate": "mean"
                },
                "tooltip": [
                  {
                    "type": "nominal",
                    "field": "category",
                    "title": "Category"
                  },
                  {
                    "type": "quantitative",
                    "field": "rental_rate",
                    "title": "Avg rate",
                    "format": "$.2f",
                    "aggregate": "mean"
                  },
                  {
                    "type": "quantitative",
                    "field": "length",
                    "title": "Avg length",
                    "format": ".1f",
                    "aggregate": "mean"
                  },
                  {
                    "type": "quantitative",
                    "field": "actor_count",
                    "title": "Avg cast",
                    "format": ".1f",
                    "aggregate": "mean"
                  },
                  {
                    "type": "quantitative",
                    "title": "Films",
                    "aggregate": "count"
                  }
                ]
              }
            },
            {
              "mark": {
                "dx": 4,
                "type": "text",
                "align": "left",
                "fontSize": 10
              },
              "encoding": {
                "x": {
                  "type": "quantitative",
                  "field": "rental_rate",
                  "aggregate": "mean"
                },
                "y": {
                  "sort": {
                    "op": "mean",
                    "field": "rental_rate",
                    "order": "descending"
                  },
                  "type": "nominal",
                  "field": "category"
                },
                "text": {
                  "type": "quantitative",
                  "field": "rental_rate",
                  "format": "$.2f",
                  "aggregate": "mean"
                }
              }
            }
          ],
          "title": {
            "text": "Value: avg rental rate by category",
            "anchor": "start",
            "fontSize": 13
          },
          "height": 250,
          "transform": [
            {
              "filter": "datum.actor_count >= minCast"
            },
            {
              "filter": "ratingPick == 'All' || datum.rating == ratingPick"
            }
          ]
        }
      ],
      "resolve": {
        "scale": {
          "color": "independent"
        }
      }
    },
    {
      "mark": {
        "type": "circle",
        "stroke": "white",
        "opacity": 0.72,
        "tooltip": true,
        "strokeWidth": 1
      },
      "title": {
        "text": "Every film: runtime vs price (size = cast, colour = rating)",
        "anchor": "start",
        "fontSize": 13
      },
      "height": 300,
      "params": [
        {
          "name": "brush",
          "select": {
            "type": "interval",
            "encodings": [
              "x",
              "y"
            ]
          }
        }
      ],
      "encoding": {
        "x": {
          "type": "quantitative",
          "field": "length",
          "scale": {
            "nice": true,
            "zero": false
          },
          "title": "Runtime (min)"
        },
        "y": {
          "axis": {
            "format": "$.2f"
          },
          "type": "quantitative",
          "field": "rental_rate",
          "scale": {
            "nice": true,
            "zero": false
          },
          "title": "Rental rate ($)"
        },
        "size": {
          "type": "quantitative",
          "field": "actor_count",
          "scale": {
            "range": [
              24,
              750
            ]
          },
          "title": "Cast",
          "legend": {
            "orient": "right"
          }
        },
        "color": {
          "type": "nominal",
          "field": "rating",
          "scale": {
            "scheme": "tableau10"
          },
          "title": "Rating",
          "legend": {
            "orient": "right"
          }
        },
        "opacity": {
          "value": 0.8
        },
        "tooltip": [
          {
            "type": "nominal",
            "field": "title",
            "title": "Film"
          },
          {
            "type": "nominal",
            "field": "category",
            "title": "Category"
          },
          {
            "type": "nominal",
            "field": "rating",
            "title": "Rating"
          },
          {
            "type": "quantitative",
            "field": "length",
            "title": "Length (min)"
          },
          {
            "type": "quantitative",
            "field": "rental_rate",
            "title": "Rate",
            "format": "$.2f"
          },
          {
            "type": "quantitative",
            "field": "actor_count",
            "title": "Cast"
          },
          {
            "type": "quantitative",
            "field": "price_per_min",
            "title": "$ / min",
            "format": "$.3f"
          }
        ]
      },
      "transform": [
        {
          "filter": "datum.actor_count >= minCast"
        },
        {
          "filter": "ratingPick == 'All' || datum.rating == ratingPick"
        }
      ]
    },
    {
      "mark": {
        "type": "bar",
        "color": "#60a5fa",
        "tooltip": true,
        "cornerRadiusTopLeft": 3,
        "cornerRadiusTopRight": 3
      },
      "title": {
        "text": "Runtime distribution (follows brush + rating + cast)",
        "anchor": "start",
        "fontSize": 13
      },
      "height": 130,
      "encoding": {
        "x": {
          "bin": {
            "maxbins": 28
          },
          "type": "quantitative",
          "field": "length",
          "title": "Runtime (min, binned)"
        },
        "y": {
          "type": "quantitative",
          "title": "Films",
          "aggregate": "count"
        },
        "tooltip": [
          {
            "type": "quantitative",
            "title": "Films",
            "aggregate": "count"
          },
          {
            "type": "quantitative",
            "field": "rental_rate",
            "title": "Avg rate",
            "format": "$.2f",
            "aggregate": "mean"
          },
          {
            "type": "quantitative",
            "field": "actor_count",
            "title": "Avg cast",
            "format": ".1f",
            "aggregate": "mean"
          }
        ]
      },
      "transform": [
        {
          "filter": {
            "param": "brush"
          }
        },
        {
          "filter": "ratingPick == 'All' || datum.rating == ratingPick"
        },
        {
          "filter": "datum.actor_count >= minCast"
        }
      ]
    }
  ],
  "autosize": {
    "type": "fit",
    "contains": "padding"
  },
  "transform": [
    {
      "as": "price_per_min",
      "calculate": "datum.rental_rate / datum.length"
    },
    {
      "as": "cast_band",
      "calculate": "datum.actor_count >= 7 ? 'Large cast (7+)' : datum.actor_count >= 5 ? 'Medium cast (5-6)' : 'Small cast (<5)'"
    }
  ]
};

(async () => {
  try {
    const ds = await prisma.tblDatasources.findFirst({
      where: { tenantID: TENANT_ID, datasourceTitle: { equals: DATASOURCE_TITLE, mode: 'insensitive' } },
    });
    if (!ds) throw new Error('PagilaDB datasource not found in tenant');
    console.log('DS', ds.datasourceID, ds.datasourceTitle);

    const page = await prisma.tblAppPages.findFirst({ where: { tenantID: TENANT_ID, appPageTitle: PAGE_TITLE } });
    if (!page) throw new Error('Pagila Film Catalog page not found');
    console.log('PAGE', page.appPageID);

    // 1. Query \u2014 find or create
    let query = await prisma.tblDataQueries.findFirst({ where: { tenantID: TENANT_ID, dataQueryTitle: QUERY_TITLE } });
    const queryOptions = { queryType: 'query', query: LANDSCAPE_SQL, inputDefinitions: [] };
    if (query) {
      console.log('FOUND query', query.dataQueryID, '\u2014 updating SQL');
      await prisma.tblDataQueries.update({
        where: { dataQueryID: query.dataQueryID },
        data: { dataQueryOptions: queryOptions, datasourceID: ds.datasourceID, datasourceType: 'postgresql', dataQueryDescription: 'Rich per-film rows powering the Catalog Landscape Vega dashboard (category, rating, runtime, price, cast).' },
      });
    } else {
      console.log('CREATING query');
      query = await dataQueryService.createDataQuery({
        userID: USER_ID, tenantID: TENANT_ID,
        dataQueryTitle: QUERY_TITLE,
        dataQueryOptions: queryOptions,
        datasourceID: ds.datasourceID,
        datasourceType: 'postgresql',
        runOnLoad: false,
        authContext: AUTH,
      });
      await prisma.tblDataQueries.update({
        where: { dataQueryID: query.dataQueryID },
        data: { dataQueryDescription: 'Rich per-film rows powering the Catalog Landscape Vega dashboard (category, rating, runtime, price, cast).' },
      });
      console.log('CREATED query', query.dataQueryID);
    }

    // 2. Widget \u2014 find or create (spec is render-verified, see header)
    const widgetConfig = {
      vegaSpec: LANDSCAPE_SPEC,
      options: { showActions: false, renderer: 'svg' },
      events: {},
      isLoading: '{{ state.queries.catalog_landscape.isLoading }}',
      showHeader: true,
    };

    let widget = await prisma.tblWidgets.findFirst({ where: { tenantID: TENANT_ID, widgetTitle: WIDGET_TITLE } });
    if (widget) {
      console.log('FOUND widget', widget.widgetID, '\u2014 updating spec');
      await prisma.tblWidgets.update({
        where: { widgetID: widget.widgetID },
        data: { widgetType: 'vega-lite', widgetDescription: WIDGET_DESC, widgetConfig },
      });
    } else {
      console.log('CREATING widget');
      widget = await widgetService.createWidget({
        authContext: AUTH, tenantID: TENANT_ID,
        widgetTitle: WIDGET_TITLE,
        widgetDescription: WIDGET_DESC,
        widgetType: 'vega-lite',
        widgetConfig,
      });
      console.log('CREATED widget', widget.widgetID);
    }

    // 3. Attach to page (query alias + widget key + layout row near top)
    const cfg = page.appPageConfig || {};
    cfg.dataSources = cfg.dataSources || [];
    cfg.widgets = cfg.widgets || [];
    cfg.layout = cfg.layout || { id: 'ROOT', type: 'column', children: [] };

    const widgetKey = `widget_${widget.widgetID}_1`;
    const dsEntry = cfg.dataSources.find((d) => d.alias === QUERY_ALIAS);
    if (!dsEntry) {
      cfg.dataSources.push({ type: 'query', alias: QUERY_ALIAS, queryID: query.dataQueryID, triggerMode: 'auto', refreshOn: [], inputValues: {} });
      console.log('ADDED dataSource alias', QUERY_ALIAS);
    } else {
      dsEntry.queryID = query.dataQueryID;
      dsEntry.triggerMode = 'auto';
      dsEntry.refreshOn = [];
      dsEntry.inputValues = {};
      console.log('UPDATED dataSource alias', QUERY_ALIAS);
    }

    if (!cfg.widgets.includes(widgetKey)) {
      cfg.widgets.push(widgetKey);
      console.log('ADDED widgetKey', widgetKey);
    } else {
      console.log('widgetKey already in page.widgets');
    }

    const kids = cfg.layout.children || [];
    const at = kids.findIndex((r) => JSON.stringify(r).includes(widgetKey));
    if (at === -1) {
      const stamp = Date.now().toString(36);
      kids.splice(1, 0, {
        id: `row_landscape_${stamp}`, type: 'row', sizing: 'auto',
        children: [{ id: `slot_landscape_${stamp}`, span: 12, type: 'widget', sizing: 'fill', widgetKey }],
      });
      console.log('ADDED layout row at index 1');
    } else if (at > 1) {
      const [row] = kids.splice(at, 1);
      kids.splice(1, 0, row);
      console.log(`MOVED layout row from index ${at} to 1`);
    } else {
      console.log('layout row already near top');
    }
    cfg.layoutVersion = 2;

    cfg._legacyLayouts = cfg._legacyLayouts || {};
    cfg._legacyLayouts.lg = cfg._legacyLayouts.lg || [];
    if (!cfg._legacyLayouts.lg.find((e) => e.i === widgetKey)) {
      const maxY = cfg._legacyLayouts.lg.reduce((m, e) => Math.max(m, (e.y || 0) + (e.h || 0)), 0);
      cfg._legacyLayouts.lg.push({ i: widgetKey, x: 0, y: maxY, w: 24, h: 26 });
      console.log('ADDED legacy layout at y', maxY);
    }

    await prisma.tblAppPages.update({ where: { appPageID: page.appPageID }, data: { appPageConfig: cfg } });
    console.log('DONE \u2014 page updated. Query:', query.dataQueryID, 'Widget:', widget.widgetID, 'Key:', widgetKey);
  } catch (e) {
    console.error('SEED FAIL', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
