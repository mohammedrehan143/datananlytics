# Discrete Probability Distributions — AIML Laboratory

Interactive educational web application designed for undergraduate Artificial Intelligence and Machine Learning (AIML) students to explore theoretical properties, statistics, probability mass functions (PMF), cumulative distribution functions (CDF), and visualizations of discrete distributions.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🚀 Features

- **Binomial Distribution ($X \sim B(n, p)$)**:
  - Interactive controls for trials $n$ and probability $p$ with strict validations ($n \ge 1$, $0 \le p \le 1$).
  - Summary statistics: Mean, Variance, Standard Deviation, Second Moment $E[X^2]$, and Skewness.
  - Interactive PMF Calculator ($P(X = k)$) with formula and clear explanation.
  - Interactive CDF Calculator ($P(X \le k)$ and $P(X > k)$).
  - Dynamic PMF Bar Chart with a vertical dashed reference line at the mean ($\mu$), highlighting the selected $k$, and real-time tooltips.
- **Poisson Distribution ($X \sim \text{Poisson}(\lambda)$)**:
  - Event rate $\lambda$ controls with one-click presets ($\lambda = 2, 6, 10$).
  - Interactive PMF & CDF calculators.
  - Distribution visualizer illustrating the normal approximation as $\lambda$ increases.
- **Geometric Distribution ($X \sim \text{Geom}(p)$)**:
  - Trial-to-first-success modeling, PMF curves, and moment calculations.
- **Built-in Lab Exercises & Verification**:
  - Pre-loaded configurations for Exercise 1 ($n=15, p=0.6$) and Exercise 2 ($\lambda=6$) with step-by-step mathematical solutions and inferences.

---

## 🛠️ Deploy to Vercel

### Option 1: One-Click / GitHub Integration (Recommended)
1. Push this repository to GitHub: `https://github.com/mohammedrehan143/datananlytics`.
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New Project"** &rarr; **"Import Git Repository"**.
4. Select `datananlytics`.
5. Keep default settings (Framework: *Other*, Root Directory: `./`).
6. Click **Deploy**. Vercel will instantly host your lab application with HTTPS and global CDN.

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally (if not installed)
npm i -g vercel

# Deploy directly from this directory
vercel
```

---

## 💻 Local Usage

You can open `index.html` directly in any web browser without needing any backend server:
```bash
# On Windows PowerShell:
Start-Process "index.html"
```
Or serve locally using `npx`:
```bash
npx serve .
```

---

## 📁 Project Structure

```text
├── index.html       # Semantic HTML layout and lab UI tabs
├── style.css        # Academic, responsive modern UI styling
├── app.js           # Math calculations, reactivity & Canvas/Chart.js visualizer
├── vercel.json      # Vercel deployment configuration
├── package.json     # Project metadata and scripts
├── .gitignore       # Git ignore rules for clean repository
└── README.md        # Documentation and deployment guide
```

---
# Probability Distributions Experiment

## Status: Completed ✅

Successfully completed the probability distributions experiment using the web application.

### Experiments Performed

- **Binomial Distribution:** Calculated the mean, variance, and probability of exactly 2 defects for \(n = 20\) and \(p = 0.05\).
- **Probability Variation:** Changed the defect probability from \(0.05\) to \(0.10\) and observed the shift in the distribution.
- **Poisson Distribution:** Calculated defect probabilities using \(\lambda = 5\) for 100 inspected products.
- **Geometric Distribution:** Examined the probability of detecting the first defect on different inspection attempts using \(p = 0.05\).
- **Graphical Analysis:** Visualized probability distributions and recorded observations.

### Results

| Distribution | Parameters | Results |
|---|---|---|
| Binomial | \(n=20,\ p=0.05\) | Mean = 1, Variance = 0.95 |
| Binomial | \(n=20,\ p=0.10\) | Mean = 2, Variance = 1.8 |
| Poisson | \(\lambda=5\) | Mean = 5, Variance = 5 |
| Geometric | \(p=0.05\) | Mean attempts = 20 |

### Conclusion

The experiment demonstrated how Binomial, Poisson, and Geometric distributions can be applied to quality-control problems. Numerical calculations and graphical observations helped explain defect probabilities, changes in defect rates, and the probability of detecting the first defect.

**Outcome:** All assigned experiment steps were completed, and the numerical results and graph observations were documented.
## 📜 License
MIT License. Created for AIML Laboratory studies.
