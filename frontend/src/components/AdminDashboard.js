import React, { useEffect, useState } from "react";
import API from "../api";
import { Typography } from "@mui/material";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartTooltip,
    Legend as RechartLegend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";

export default function AdminDashboard() {
    const [requestsData, setRequestsData] = useState(null);
    const [itemsData, setItemsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        Promise.all([
            API.get("/Requests").then((r) => r.data.requests || []),
            API.get("/items").then((r) => r.data),
        ])
            .then(([requests, items]) => {
                if (!mounted) return;
                setRequestsData(requests);
                setItemsData(items);
                setError(null);
            })
            .catch((err) => {
                if (!mounted) return;
                console.error("AdminDashboard fetch error:", err);
                console.error("Response data:", err.response?.data);
                console.error("Response status:", err.response?.status);
                setError(err.message || "Error fetching data");
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    if (loading) return <Typography>Loading dashboard...</Typography>;
    if (error) return <Typography color="error">Error: {error}</Typography>;

    // Ensure data is arrays
    const requestsArray = Array.isArray(requestsData) ? requestsData : [];
    const itemsArray = Array.isArray(itemsData) ? itemsData : [];

    // Prepare pie data: requests by status
    const requestsByStatusMap = requestsArray.reduce((acc, req) => {
        const status = (req.status || "Unknown").toString();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const requestsPieData = Object.entries(requestsByStatusMap)
        .filter(([name, value]) => value > 0) // Only show statuses with data
        .map(([name, value]) => ({ name, value }));

    // Prepare bar data: available items per category
    const itemsByCategoryMap = itemsArray.reduce((acc, item) => {
        const category = (item.category || "Uncategorized").toString();

        // determine available count for this item (support multiple common shapes)
        let count = 0;
        if (typeof item.quantity === "number") {
            count = item.quantity;
        } else if (typeof item.availableCount === "number") {
            count = item.availableCount;
        } else if (typeof item.available === "boolean") {
            count = item.available ? 1 : 0;
        } else if (typeof item.count === "number") {
            count = item.count;
        } else {
            // fallback: treat as 1 item if it exists
            count = 1;
        }

        acc[category] = (acc[category] || 0) + count;
        return acc;
    }, {});
    const itemsBarData = Object.entries(itemsByCategoryMap)
        .filter(([category, available]) => available > 0) // Only show categories with available items
        .map(([category, available]) => ({ category, available }));

    if (requestsPieData.length === 0) {
        return (
            <div>
                <Typography variant="h5" gutterBottom>
                    Admin Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    No request data available to display.
                </Typography>
            </div>
        );
    }

    const pieColors = [
        "#4e79a7",
        "#f28e2b",
        "#e15759",
        "#76b7b2",
        "#59a14f",
        "#edc949",
        "#b07aa1",
        "#ff9da7",
        "#9c755f",
        "#bab0ab",
    ];

    const containerStyle = { width: "100%", height: 360, marginBottom: 24, minWidth: 320, minHeight: 360 };

    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Admin Dashboard
            </Typography>

            <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ flex: "1 1 360px", minWidth: 320 }}>
                    <Typography variant="h6" gutterBottom>
                        Requests by Status
                    </Typography>
                    <div style={containerStyle}>
                        <ResponsiveContainer width="100%" height={360}>
                            <PieChart>
                                <Pie
                                    data={requestsPieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius="80%"
                                    label
                                >
                                    {requestsPieData.map((entry, idx) => (
                                        <Cell
                                            key={`cell-${idx}`}
                                            fill={pieColors[idx % pieColors.length]}
                                        />
                                    ))}
                                </Pie>
                                <RechartTooltip />
                                <RechartLegend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}