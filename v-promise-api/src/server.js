import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import inspectionRoutes from "./routes/inspectionRoutes.js";
import valuationRoutes from "./routes/valuationRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import masterDataRoutes from "./routes/masterDataRoutes.js";

dotenv.config();

const app = express();

// CORS validation
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/", authRoutes);
app.use("/", vehicleRoutes);
app.use("/", inspectionRoutes);
app.use("/", valuationRoutes);
app.use("/", inventoryRoutes);
app.use("/", masterDataRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
