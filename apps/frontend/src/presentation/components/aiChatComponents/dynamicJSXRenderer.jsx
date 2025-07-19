import React, { useEffect, useState } from "react";
import * as Babel from "@babel/standalone";
import * as Recharts from "recharts";
import * as ReactLib from "react";
import PropTypes from "prop-types";

export const DynamicJSXRenderer = ({ jsxCode, data }) => {
    DynamicJSXRenderer.propTypes = {
        jsxCode: PropTypes.string.isRequired,
        data: PropTypes.array.isRequired,
    };
    const [Component, setComponent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!jsxCode || !data) return;

        try {
            const fullCode = `
        const { ResponsiveContainer, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, Area, BarChart, Bar, LineChart, Line } = Recharts;
        const React = ReactLib;
        const data = ${JSON.stringify(data)};

        const dateFormatter = (value) => new Date(value).toLocaleDateString();
        const currencyFormatter = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

        function ChartWrapper() {
          return (
            ${jsxCode}
          );
        }

        ChartWrapper;
      `;

            const transformed = Babel.transform(fullCode, { presets: ["react"] }).code;

            const resultFn = new Function("ReactLib", "Recharts", transformed);
            const ChartComponent = resultFn(React, Recharts);
            setComponent(() => ChartComponent);
        } catch (err) {
            console.error("JSX compilation failed:", err);
            setError(err.message);
            setComponent(null);
        }
    }, [jsxCode, data]);

    if (error) {
        return <pre className="text-red-500 text-xs">{error}</pre>;
    }

    if (!Component) {
        return <p className="text-sm text-gray-400 italic">Rendering chart...</p>;
    }

    return (
        <div className="w-full h-[400px]">
            <Component />
        </div>
    );
};


