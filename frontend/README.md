# 🌌 The Kinetix — Virtual Physics Lab Portal

**The Kinetix** is a premium, interactive virtual laboratories portal designed for first-year engineering students studying **Applied Physics**. It provides a state-of-the-art simulation workspace where students can perform experiments, collect data, fill observation tables, and verify calculations using real-world physical formulas.

The portal combines high-definition, interactive canvas-based simulations with standard academic manuals and curricula (aligned with institutions like the **SIES Graduate School of Technology**, **Amrita Virtual Labs**, and **IIT Kharagpur Virtual Labs**).

---

## 🎨 Interactive Live Demos

*   **Hero Sandbox** ([`HeroSandbox.jsx`](file:///c:/Users/DELL/thekinetix/src/components/HeroSandbox.jsx)): A live showcase on the home page displaying real-time rendering of **laser diffraction patterns**, **Newton's rings**, and **wave superposition** with adjustable parameters (wavelength, slit width, and lens curvature).
*   **Physics in Motion Centerpiece** ([`PhysicsInMotion.jsx`](file:///c:/Users/DELL/thekinetix/src/components/PhysicsInMotion.jsx)): A live simulation playground featuring:
    *   *Prism Refraction & Spectrum Dispersion* (simulating white light splitting via Cauchy's equation).
    *   *3D Atomic Orbitals* (visualizing Electron Wave Functions and probability densities).
    *   *Wave Ripples* (generating custom interference waves through cursor-clicking interactions).
*   **Interactive Particle Canvas** ([`KineticCanvas.jsx`](file:///c:/Users/DELL/thekinetix/src/components/KineticCanvas.jsx)): Interactive particle grid background reacting to mouse position and movement.

---

## 🧪 Virtual Experiments Available

The portal hosts 7 fully virtualized experiments under the `/exp/:id` workspace route. Each contains interactive simulators, interactive sliders, theory guides, verified formula modules, and automated observation tables:

| Exp # | Experiment Title | Key Physics / Domain | Target Formulae & Constants |
| :---: | :--- | :--- | :--- |
| **01** | **Wedge-Shaped Film** ([`Exp01.jsx`](file:///c:/Users/DELL/thekinetix/src/experiments/Exp01.jsx)) | Optics, Interference | Fringe Width: $\beta = \frac{X_2 - X_1}{N}$<br>Wire Thickness: $t = \frac{\lambda L}{2\beta}$<br>($\lambda = 5893$ Å Sodium Light) |
| **02** | **Newton's Rings** ([`Exp02.jsx`](file:///c:/Users/DELL/thekinetix/src/experiments/Exp02.jsx)) | Optics, Interference | Ring Diameter: $D_n^2 = 4n R \lambda$<br>Radius of Curvature: $R = \frac{D_{m+p}^2 - D_m^2}{4p\lambda}$ |
| **03** | **Diffraction Grating** ([`Exp03.jsx`](file:///c:/Users/DELL/thekinetix/src/experiments/Exp03.jsx)) | Diffraction, Wave Optics | Grating Equation: $(a+b)\sin\theta = n\lambda$<br>Grating constant: $N = 1000\text{ lines/cm}$ |
| **04** | **Numerical Aperture of Fibre** ([`Exp04.jsx`](file:///c:/Users/DELL/thekinetix/src/experiments/Exp04.jsx)) | Fibre Optics, Photonics | Numerical Aperture: $\text{NA} = \sin\theta = \frac{W}{\sqrt{4L^2 + W^2}}$<br>Acceptance Angle: $\theta = \sin^{-1}(\text{NA})$ |
| **05** | **Hall Coefficient** ([`Exp05.jsx`](file:///c:/Users/DELL/thekinetix/src/experiments/Exp05.jsx)) | Semiconductors, Electromagnetism | Hall Coefficient: $R_H = \frac{V_H \cdot t}{I \cdot B}$<br>Carrier Density: $n = \frac{1}{R_H \cdot e}$ |
| **06** | **Ultrasonic Distance Meter** ([`Exp06.jsx`](file:///c:/Users/DELL/thekinetix/src/experiments/Exp06.jsx)) | Ultrasonics, Time-of-Flight | Distance: $d = \frac{v \cdot t}{2}$<br>Speed of Sound: $v = 330\text{ m/s}$ |
| **07** | **Photo-Diode I-V Characteristics** ([`Exp07.jsx`](file:///c:/Users/DELL/thekinetix/src/experiments/Exp07.jsx)) | Semiconductors, Optoelectronics | Reverse Current: $I = I_0(e^{eV/\eta kT} - 1) - I_{ph}$<br>Photocurrent: $I_{ph} \propto \text{Light Intensity}$ |

---

## 🛠️ Architecture & Technology Stack

The application is engineered as a highly responsive single-page web app with the following stack:

*   **Core Logic:** [React 19](https://react.dev/) & [React DOM](https://react.dev/reference/react-dom)
*   **Routing:** [React Router DOM 7](https://reactrouter.com/) for fluid page transitions between the Home landing page, the individual experiment rooms, and the references portal.
*   **Build Tool & Dev Server:** [Vite 8](https://vite.dev/) (fast hot module reloading).
*   **Styling (Raw CSS):** Fully customized, curated design tokens defined in [`index.css`](file:///c:/Users/DELL/thekinetix/src/index.css). Features a modern aesthetic incorporating:
    *   **Glassmorphic panels** with backdrop-filters.
    *   **Custom neon glowing effects** dynamically matched with laser light wavelengths.
    *   **Dark-mode dashboard styling** contrasting slate and cyan themes.
    *   **Physics grid lines** and digital dashboard controls.

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18 or higher recommended) and `npm` installed.

### 2. Installation
Clone the repository and install the required dependencies:
```bash
# Clone the repository
cd thekinetix

# Install dependencies
npm install
```

### 3. Run Development Server
Start the local server with hot reloading enabled:
```bash
npm run dev
```
Open your browser and navigate to the local URL (usually `http://localhost:5173`).

### 4. Build for Production
To build the application for deployment:
```bash
npm run build
```
This generates a static production build in the `dist/` directory.

### 5. Preview Production Build
Preview the production build locally:
```bash
npm run preview
```

### 6. Lint Code
Run ESLint to check for stylistic and coding issues:
```bash
npm run lint
```

---

## 🏛️ Curriculum and References

The simulations, formulas, and verification limits are compiled with reference to engineering courses, lab manuals, and official academic resources:
1.  **Amrita Virtual Labs:** Newton's rings and optics simulations references.
2.  **IIT Kharagpur Virtual Labs:** Advanced solid state physics experiments.
3.  **SIES Graduate School of Technology (SIES GST):** Applied Physics Laboratory course manual for First Year Engineering.
4.  **PhET Interactive Simulations:** Conceptual UI guidelines for intuitive physical slider interactions.

For detailed sources, visit the bibliography page inside the web app or review [`References.jsx`](file:///c:/Users/DELL/thekinetix/src/pages/References.jsx).

