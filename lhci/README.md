# LHCI Configuration

This directory contains Lighthouse CI configuration files for automated performance monitoring and testing of the AlgoLens application.

## 📁 Contents

- **[lighthouserc.json](lighthouserc.json)** - Main Lighthouse CI configuration
- **[budgets.json](budgets.json)** - Performance budget definitions

## 🎯 Purpose

Lighthouse CI (LHCI) provides:

- Automated performance testing in CI/CD pipelines
- Performance regression detection
- Bundle size monitoring
- Accessibility compliance checking
- SEO optimization validation
- Progressive Web App audits

## ⚙️ Configuration

### Lighthouse CI Configuration (lighthouserc.json)

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "npm run preview",
      "startServerReadyPattern": "Local:",
      "url": [
        "http://localhost:4173/",
        "http://localhost:4173/algorithms",
        "http://localhost:4173/algorithms/sorting",
        "http://localhost:4173/algorithms/sorting/bubble-sort"
      ]
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:pwa": ["warn", { "minScore": 0.8 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### Performance Budgets (budgets.json)

```json
{
  "budgets": [
    {
      "path": "/**",
      "timings": [
        {
          "metric": "first-contentful-paint",
          "budget": 2000,
          "tolerance": 200
        },
        {
          "metric": "largest-contentful-paint",
          "budget": 2500,
          "tolerance": 300
        },
        {
          "metric": "cumulative-layout-shift",
          "budget": 0.1,
          "tolerance": 0.05
        },
        {
          "metric": "total-blocking-time",
          "budget": 300,
          "tolerance": 50
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 500000
        },
        {
          "resourceType": "stylesheet",
          "budget": 100000
        },
        {
          "resourceType": "image",
          "budget": 1000000
        },
        {
          "resourceType": "document",
          "budget": 50000
        },
        {
          "resourceType": "other",
          "budget": 200000
        },
        {
          "resourceType": "total",
          "budget": 2000000
        }
      ],
      "resourceCounts": [
        {
          "resourceType": "script",
          "budget": 10
        },
        {
          "resourceType": "stylesheet",
          "budget": 5
        },
        {
          "resourceType": "image",
          "budget": 20
        },
        {
          "resourceType": "third-party",
          "budget": 5
        }
      ]
    }
  ]
}
```

## 🚀 Usage

### Local Testing

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run Lighthouse CI locally
lhci autorun

# Run with specific configuration
lhci collect --config=./lhci/lighthouserc.json

# Analyze results
lhci assert --config=./lhci/lighthouserc.json

# Upload results
lhci upload --config=./lhci/lighthouserc.json
```

### CI/CD Integration

```yaml
# GitHub Actions workflow
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun --config=./lhci/lighthouserc.json
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

## 📊 Monitoring Metrics

### Core Web Vitals

- **First Contentful Paint (FCP)**: < 2.0s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Total Blocking Time (TBT)**: < 300ms
- **Time to Interactive (TTI)**: < 3.8s

### Performance Categories

- **Performance**: ≥ 90/100
- **Accessibility**: ≥ 95/100
- **Best Practices**: ≥ 90/100
- **SEO**: ≥ 90/100
- **PWA**: ≥ 80/100

### Resource Budgets

- **JavaScript Bundle**: < 500KB
- **CSS Bundle**: < 100KB
- **Images**: < 1MB total
- **Total Resources**: < 2MB
- **Request Count**: < 50 requests

## 🔧 Optimization Strategies

### Performance Optimization

- Code splitting and lazy loading
- Image optimization and modern formats
- Efficient caching strategies
- Bundle size reduction
- Critical resource prioritization

### Accessibility Improvements

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

### SEO Enhancement

- Meta tags optimization
- Structured data markup
- Sitemap generation
- Clean URL structure
- Mobile-friendly design

### PWA Features

- Service worker implementation
- Offline functionality
- App manifest configuration
- Install prompts
- Push notifications

## 📈 Reporting and Analysis

### Report Generation

```bash
# Generate detailed HTML report
lhci collect --config=./lhci/lighthouserc.json
lhci assert --config=./lhci/lighthouserc.json
lhci upload --config=./lhci/lighthouserc.json

# View reports
open .lighthouseci/lhci_reports/*.html
```

### Continuous Monitoring

- Automated performance regression detection
- Historical performance tracking
- Alert notifications for budget violations
- Performance trend analysis
- Comparative analysis between builds

### Integration with Monitoring Tools

- Google PageSpeed Insights integration
- Sentry performance monitoring
- Real User Monitoring (RUM) data
- Analytics performance tracking

## 🎯 Best Practices

### Configuration Management

- Environment-specific configurations
- Shared budget definitions
- Version-controlled settings
- Documentation of thresholds

### Testing Strategy

- Multiple URL testing
- Different network conditions
- Mobile and desktop audits
- Critical user journey coverage

### Performance Culture

- Regular performance reviews
- Performance-first development
- Automated quality gates
- Team performance awareness

## 🔄 Maintenance

### Regular Tasks

- Update performance budgets
- Review and adjust thresholds
- Monitor new web standards
- Update Lighthouse CI version
- Analyze performance trends

### Troubleshooting

- Debug failed assertions
- Investigate performance regressions
- Optimize slow-loading resources
- Fix accessibility issues
- Resolve PWA audit failures

## 🔗 Related Resources

- **Build System**: `../vite.config.ts` - Build optimization configuration
- **Performance Scripts**: `../scripts/perf-benchmark.mjs` - Custom performance testing
- **CI/CD**: `../.github/workflows/` - Automated testing workflows
- **Monitoring**: External performance monitoring tools and dashboards
