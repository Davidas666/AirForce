import React, { useEffect, useState } from "react";
import { getUserFromCookie } from "../utils/auth";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const SUBS = [
  { key: "morning", label: "Morning" },
  { key: "weekly", label: "Weekly" },
  { key: "daily_thrice", label: "Daily thrice" },
];

export default function SubscriptionToggles({ selectedCity }) {
  const [user, setUser] = useState(getUserFromCookie());
  const [subs, setSubs] = useState({});
  const [loading, setLoading] = useState(false);

  // Keep user in sync with cookie
  useEffect(() => {
    const interval = setInterval(() => setUser(getUserFromCookie()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch current subscriptions for this user/city
  useEffect(() => {
    if (!user?.id || !selectedCity) return;
    setLoading(true);
    fetch(`/api/subscription/user?telegram_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        const found = (data.subscriptions || []).find(
          (s) => s.city.toLowerCase() === selectedCity.toLowerCase()
        );
        setSubs({
          weekly: !!found?.weekly_forecast,
          morning: !!found?.morning_forecast,
          daily_thrice: !!found?.daily_thrice_forecast,
        });
      })
      .finally(() => setLoading(false));
  }, [user?.id, selectedCity]);

  const handleToggle = (type) => {
    if (!user?.id || !selectedCity) return;
    const enabled = !subs[type];
    setLoading(true);
    fetch("/api/subscription/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegram_id: user.id,
        city: selectedCity,
        type,
        enabled,
      }),
    })
      .then((res) => res.json())
      .then(() => setSubs((prev) => ({ ...prev, [type]: enabled })))
      .finally(() => setLoading(false));
  };

  if (!user?.id || !selectedCity) return null;

  return (
    <Box
      sx={{
        my: 2,
        p: 2,
        bgcolor: "#e3f2fd",
        borderRadius: 2,
        boxShadow: 1,
        minWidth: 220,
        maxWidth: 320,
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1, color: "#1976d2" }}>
        Weather subscriptions for{" "}
        <span style={{ textDecoration: "underline" }}>{selectedCity}</span>
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          justifyContent: "center",
        }}
      >
        {SUBS.map((s) => (
          <FormControlLabel
            key={s.key}
            control={
              <Switch
                checked={!!subs[s.key]}
                onChange={() => handleToggle(s.key)}
                disabled={loading}
                color="primary"
              />
            }
            label={s.label}
          />
        ))}
      </Box>
    </Box>
  );
}
