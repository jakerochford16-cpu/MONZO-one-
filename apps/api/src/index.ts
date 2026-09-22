import express from "express";
import cors from "cors";
import { countriesRouter } from "./routes/countries";
import { activitiesRouter } from "./routes/activities";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/countries", countriesRouter);
app.use("/api/activities", activitiesRouter);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
