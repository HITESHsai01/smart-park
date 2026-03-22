# 🚗 Smart-Parking (The Airbnb for Parking)

**Smart-Parking** is a dual-sided marketplace that connects drivers with private parking spot owners in real-time. It solves the urban parking crisis by allowing landowners to monetize unused space while giving drivers a seamless way to find and book guaranteed parking spots.

## 💡 The Idea

The core concept is to digitize the parking experience:
1.  **For Drivers**: No more driving around in circles. Find a spot on the map, book it for a specific duration, and navigate directly to it.
2.  **For Owners**: Turn empty driveways or lots into passive income. Manage availability, set dynamic pricing, and track earnings through a dedicated dashboard.
3.  **Dual-Role System**: A unique feature where every user can be both a driver and a host without needing separate accounts.

---

## 🛠️ How We Did It: Technical Architecture

We built this project using a **Database-First** approach to ensure data integrity and scalable business logic.

### 1. The Database Logic (Prisma & PostgreSQL)
We designed a relational schema to handle the complexity of parking management:
-   **Hierarchical Structure**: `User` -> `Owner` -> `ParkingLot` -> `Slot`.
-   **Smart Slots**: Each `ParkingLot` contains multiple `Slot`s (Small, Medium, Large) to accommodate different vehicle types.
-   **Conflict Prevention**: The `Booking` model enforces time constraints, ensuring no two bookings overlap for the same slot.

### 2. Next-Gen Authentication (NextAuth.js v5)
We implemented a robust authentication system using **NextAuth.js v5 (Beta)**:
-   **Role-Based Access Control (RBAC)**: Users have roles (`DRIVER`, `OWNER`, `ADMIN`).
-   **Session Enrichment**: maximizing performance by embedding the user's `role` directly into the JWT session, avoiding repeated database calls on every page load.
-   **Middleware Protection**: Automatic redirection and protection of `/owner` routes for non-authorized users.

### 3. Real-Time Map Interface
We integrated **Leaflet.js** (via `react-leaflet`) to visualize parking spots:
-   Interactive markers showing available lots.
-   Geospatial data stored in the `ParkingLot` model (`lat`, `lng`).

### 4. The Booking Engine
The booking Logic in `/app/api/bookings` handles:
-   **Validation**: Checks if a requested time slot is actually free.
-   **Inventory Management**: Updates `SlotStatus` automatically.
-   **Pricing Engine**: Calculates total cost based on `baseRate * duration`.

---

## 🏗️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Database**: PostgreSQL
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Auth**: [NextAuth.js v5](https://authjs.dev/)
-   **Styling**: TailwindCSS v4
-   **Maps**: Leaflet.js / React-Leaflet
-   **Forms**: React Hook Form + Zod Validation

---

## 📂 Project Structure

```bash
├── app
│   ├── (auth)       # Sign-in & Sign-up pages
│   ├── api          # Backend API routes (bookings, properties, etc.)
│   ├── booking      # Booking flow for drivers
│   ├── map          # Main map interface
│   ├── owner        # Owner dashboard & property management
│   └── lib          # Shared utilities (db connection, utils)
├── prisma           # Database schema & migrations
└── public           # Static assets
```

## 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Setup Environment Variables**:
    Create a `.env` file with:
    ```env
    DATABASE_URL="postgresql://..."
    AUTH_SECRET="your_secret_key"
    ```

4.  **Initialize Database**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
