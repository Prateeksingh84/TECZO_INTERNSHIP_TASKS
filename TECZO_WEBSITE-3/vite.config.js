import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: "index.html",
        admin: "admin.html",
        privacy: "privacy.html",
        terms: "terms.html",
        caseStudies: "case-studies/index.html",
        locationMysuru: "locations/mysuru-software-development-company/index.html",
        aiAutomation: "services/ai-automation/index.html",
        saas: "services/saas-product-development/index.html",
        customSoftware: "services/custom-software-development/index.html",
        ecommerce: "services/ecommerce-engineering/index.html",
        crmWorkflow: "services/crm-workflow-automation/index.html"
      }
    }
  }
});
