const fs = require('fs');

let html = fs.readFileSync('home-1.html', 'utf8');

// 1. Extend Why Choose Us
const whyTarget = `               <!-- Highlight 6: Professional Industrial Scrap Management -->
               <div class="col-lg-4 col-md-6 mb-4">
                  <div class="why-feature-card">
                     <div class="why-icon-box"><i class="fa fa-briefcase"></i></div>
                     <div>
                        <h4 style="font-size: 17px; font-weight: 700; margin-bottom: 6px;">Professional Scrap Management</h4>
                        <p style="font-size: 13px; line-height: 1.6; margin: 0;">
                           Turnkey plant waste auditing, certified destruction certificates for proprietary prototypes, and serialized Scope 3 ESG carbon offset reports for corporate governance.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>`;

const whyReplacement = `               <!-- Highlight 6: Professional Industrial Scrap Management -->
               <div class="col-lg-4 col-md-6 mb-4">
                  <div class="why-feature-card">
                     <div class="why-icon-box"><i class="fa fa-briefcase"></i></div>
                     <div>
                        <h4 style="font-size: 17px; font-weight: 700; margin-bottom: 6px;">Professional Scrap Management</h4>
                        <p style="font-size: 13px; line-height: 1.6; margin: 0;">
                           Turnkey plant waste auditing, certified destruction certificates for proprietary prototypes, and serialized Scope 3 ESG carbon offset reports for corporate governance.
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Verified Industrial Standards & Assurance Bar (Extending Why Choose Us) -->
            <div class="row">
               <div class="col-12">
                  <div class="why-assurance-bar">
                     <div class="row">
                        <div class="col-lg-3 col-sm-6 mb-3 mb-lg-0">
                           <div class="why-assurance-item">
                              <div class="why-assurance-icon"><i class="fa fa-balance-scale"></i></div>
                              <div>
                                 <h5>NIST Scale Accuracy</h5>
                                 <p>State-certified dual 80ft weighbridges with ±5kg calibrated tolerance and digital gross/tare tickets.</p>
                              </div>
                           </div>
                        </div>
                        <div class="col-lg-3 col-sm-6 mb-3 mb-lg-0">
                           <div class="why-assurance-item">
                              <div class="why-assurance-icon"><i class="fa fa-flask"></i></div>
                              <div>
                                 <h5>Thermo Niton XRF Assay</h5>
                                 <p>Instant 30-second elemental chemistry analysis for superalloys, copper, stainless &amp; high-temp metals.</p>
                              </div>
                           </div>
                        </div>
                        <div class="col-lg-3 col-sm-6 mb-3 mb-sm-0">
                           <div class="why-assurance-item">
                              <div class="why-assurance-icon"><i class="fa fa-clock-o"></i></div>
                              <div>
                                 <h5>24-Hr Container Swap</h5>
                                 <p>Dedicated roll-off fleet with GPS routing, heavy-gauge 15–50 yd³ bins, and guaranteed replacement SLA.</p>
                              </div>
                           </div>
                        </div>
                        <div class="col-lg-3 col-sm-6">
                           <div class="why-assurance-item">
                              <div class="why-assurance-icon"><i class="fa fa-university"></i></div>
                              <div>
                                 <h5>Direct Mill Settlement</h5>
                                 <p>Transparent LME/COMEX indexed payout formulas with zero broker cuts and same-day ACH wire transfers.</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Industrial Recycling Process Protocol (4-Step Sequential Workflow) -->
            <div class="why-workflow-wrap">
               <div class="row text-center mb-4">
                  <div class="col-12">
                     <span class="section-badge-tag"><i class="fa fa-cogs"></i> Operational Execution Protocol</span>
                     <h3 style="font-size: 24px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px;">HOW FERROMAX HANDLES YOUR <span>FACILITY SCRAP</span></h3>
                     <p style="font-size: 13.5px; color: #94a3b8; max-width: 650px; margin: 0 auto;">From initial site clearance to certified smelting destination, our closed-loop chain-of-custody maximizes payout accuracy and environmental compliance.</p>
                  </div>
               </div>
               <div class="row">
                  <div class="col-lg-3 col-md-6 mb-4">
                     <div class="why-workflow-card">
                        <div class="why-workflow-num">01 <i class="fa fa-truck text-muted" style="font-size: 18px;"></i></div>
                        <h5>Plant Audit &amp; Bin Placement</h5>
                        <p>Free metallurgical waste audit. Roll-off containers (15–50 yd³) deployed to your stamping lines, CNC bays, or job sites.</p>
                     </div>
                  </div>
                  <div class="col-lg-3 col-md-6 mb-4">
                     <div class="why-workflow-card">
                        <div class="why-workflow-num">02 <i class="fa fa-balance-scale text-muted" style="font-size: 18px;"></i></div>
                        <h5>Digital Tare &amp; Lab Assay</h5>
                        <p>Computerized scale check-in with synchronized optical CCTV logs and handheld XRF spectral alloy grade confirmation.</p>
                     </div>
                  </div>
                  <div class="col-lg-3 col-md-6 mb-4">
                     <div class="why-workflow-card">
                        <div class="why-workflow-num">03 <i class="fa fa-cubes text-muted" style="font-size: 18px;"></i></div>
                        <h5>Mechanical Sizing &amp; Sorting</h5>
                        <p>1,200-ton hydraulic shearing, 4,000 HP shredding, and eddy-current density separation preparing furnace-ready feedstocks.</p>
                     </div>
                  </div>
                  <div class="col-lg-3 col-md-6 mb-4">
                     <div class="why-workflow-card">
                        <div class="why-workflow-num">04 <i class="fa fa-check-circle text-muted" style="font-size: 18px;"></i></div>
                        <h5>Indexed Settlement &amp; ESG Manifest</h5>
                        <p>Transparent LME/COMEX-tied payouts sent via direct ACH along with serialized Scope 3 carbon reduction certificates.</p>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Commercial Audit Call-to-Action Bar -->
            <div class="row">
               <div class="col-12">
                  <div class="why-audit-cta-banner">
                     <div class="why-audit-cta-text">
                        <h4><i class="fa fa-shield text-warning mr-2"></i> Ready to Monetize Plant Scrap Streams with Full Transparency?</h4>
                        <p>Schedule an on-site metallurgical audit or request dedicated industrial scrap bins for your facility.</p>
                     </div>
                     <div class="d-flex align-items-center gap-2 flex-wrap">
                        <a href="contact.html" class="btn btn-warning font-weight-bold px-4 py-2" style="border-radius: 6px; font-size: 13.5px;">
                           <i class="fa fa-calendar mr-1"></i> Request Scrap Audit
                        </a>
                        <a href="#materials-catalogue-hub" class="btn btn-outline-light font-weight-bold px-3 py-2" style="border-radius: 6px; font-size: 13.5px;">
                           <i class="fa fa-th-large mr-1"></i> View Scrap Catalogue
                        </a>
                        <a href="rate-card.html" class="btn btn-outline-warning font-weight-bold px-3 py-2" style="border-radius: 6px; font-size: 13.5px;">
                           <i class="fa fa-line-chart mr-1"></i> Live Rates
                        </a>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>`;

// 2. Start of Unified Catalogue Hub
const hubStartTarget = `<div class="catalogue-nav-strip">
         <div class="container">
            <ul class="catalogue-nav-links" id="materialCategoryNav">
               <li><button type="button" class="filter-btn-chip active" data-category="all"><i class="fa fa-th-large mr-1"></i> All Categories</button></li>
               <li><button type="button" class="filter-btn-chip" data-category="ferrous"><i class="fa fa-cube text-primary mr-1"></i> Ferrous Scrap</button></li>
               <li><button type="button" class="filter-btn-chip" data-category="non-ferrous"><i class="fa fa-diamond text-success mr-1"></i> Non-Ferrous Scrap</button></li>
               <li><button type="button" class="filter-btn-chip" data-category="stainless"><i class="fa fa-shield text-info mr-1"></i> Stainless Steel Scrap</button></li>
               <li><button type="button" class="filter-btn-chip" data-category="electrical"><i class="fa fa-bolt text-warning mr-1"></i> Electrical &amp; Cable Scrap</button></li>
               <li><button type="button" class="filter-btn-chip" data-category="industrial"><i class="fa fa-industry text-danger mr-1"></i> Industrial Mixed Scrap</button></li>
            </ul>
         </div>
      </div>

      <!-- Real-Time Search & Keyword Filter Bar -->
      <section class="section-py section-darker pb-2 pt-4" id="catalogue-search-bar-section">
         <div class="container">
            <div class="row justify-content-center">
               <div class="col-lg-8">
                  <div class="rate-search-wrap mb-2">
                     <i class="fa fa-search"></i>
                     <input type="text" id="materialSearchInput" placeholder="Filter catalogue by material name, classification (ISRI), or application..." autocomplete="off">
                     <button type="button" id="searchClearBtn" class="rate-search-clear" aria-label="Clear search filter" title="Clear search"><i class="fa fa-times"></i></button>
                  </div>
                  <div id="materialFilterStatus" class="material-filter-status text-center">
                     <small id="materialFilterCountText" class="text-muted d-block">
                        Showing all 15 industrial scrap grades across 5 categories. Filter dynamically above or click any category section.
                     </small>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <!-- Empty State Container when no search results match -->
      <div id="noMaterialFound" class="container text-center py-5" style="display: none;">
         <div class="no-material-box p-4">
            <i class="fa fa-search text-warning fa-3x mb-3"></i>
            <h3 class="text-white mb-2" style="font-weight: 700;">No Scrap Grades Found</h3>
            <p class="text-muted mb-4" id="noMaterialMessage" style="max-width: 520px; margin: 0 auto 1.5rem;">
               We couldn't find any material grades matching your search. Try searching by metal name (e.g. Copper, Steel, Aluminium, Brass), grade (304, HMS 1), or ISRI code.
            </p>
            <div class="d-flex justify-content-center gap-2 flex-wrap">
               <button type="button" id="resetMaterialFilters" class="btn btn-warning font-weight-bold px-4 py-2" style="border-radius: 4px;">
                  <i class="fa fa-refresh mr-1"></i> Reset Filters &amp; View All
               </button>
            </div>
         </div>
      </div>

      <!-- =====================================================================
           SECTION 1: FERROUS SCRAP
           ===================================================================== -->
      <div id="sec-ferrous"></div>
      <section class="section-py section-darker pt-4" id="ferrous-section" data-anchor-alias="sec-ferrous" data-category-section="ferrous">
         <div class="container">`;

const hubStartReplacement = `<!-- =====================================================================
           5. UNIFIED INDUSTRIAL MATERIAL CATALOGUE HUB
           Combines Category CTAs, Real-Time Search Filter, and Scrap Grades
           in ONE cohesive section — eliminating empty spaces and disjointed containers
           ===================================================================== -->
      <section class="section-py section-darker catalogue-hub-section" id="materials-catalogue-hub">
         <div class="container">
            <!-- Hub Header -->
            <div class="catalogue-hub-header text-center mb-4">
               <span class="section-badge-tag"><i class="fa fa-cubes"></i> Secondary Commodity Specifications</span>
               <h2 class="section-main-heading">INDUSTRIAL <span>SCRAP CATALOGUE</span></h2>
               <p class="section-subtext" style="max-width: 780px; margin: 0 auto;">
                  Explore our ISRI-classified secondary metals directory. Select a category CTA below or search in real time by material name, alloy grade, or application.
               </p>
            </div>

            <!-- Unified Control Panel (Category CTAs & Integrated Search Bar) -->
            <div class="catalogue-control-panel mb-4" id="catalogueControlPanel">
               <!-- Category Filter CTAs -->
               <div class="catalogue-nav-strip-inner mb-3">
                  <ul class="catalogue-nav-links" id="materialCategoryNav">
                     <li><button type="button" class="filter-btn-chip active" data-category="all"><i class="fa fa-th-large mr-1"></i> All Categories</button></li>
                     <li><button type="button" class="filter-btn-chip" data-category="ferrous"><i class="fa fa-cube text-primary mr-1"></i> Ferrous Scrap</button></li>
                     <li><button type="button" class="filter-btn-chip" data-category="non-ferrous"><i class="fa fa-diamond text-success mr-1"></i> Non-Ferrous Scrap</button></li>
                     <li><button type="button" class="filter-btn-chip" data-category="stainless"><i class="fa fa-shield text-info mr-1"></i> Stainless Steel Scrap</button></li>
                     <li><button type="button" class="filter-btn-chip" data-category="electrical"><i class="fa fa-bolt text-warning mr-1"></i> Electrical &amp; Cable Scrap</button></li>
                     <li><button type="button" class="filter-btn-chip" data-category="industrial"><i class="fa fa-industry text-danger mr-1"></i> Industrial Mixed Scrap</button></li>
                  </ul>
               </div>

               <!-- Integrated Real-Time Search & Keyword Filter Bar -->
               <div class="row justify-content-center">
                  <div class="col-lg-8 col-md-10">
                     <div class="rate-search-wrap mb-2">
                        <i class="fa fa-search rate-search-icon"></i>
                        <input type="text" id="materialSearchInput" placeholder="Filter catalogue by material name, classification (ISRI), or application..." autocomplete="off">
                        <button type="button" id="searchClearBtn" class="rate-search-clear" aria-label="Clear search filter" title="Clear search" style="display: none;"><i class="fa fa-times"></i></button>
                     </div>
                     <div id="materialFilterStatus" class="material-filter-status text-center">
                        <small id="materialFilterCountText" class="text-muted d-block">
                           Showing all 15 industrial scrap grades across 5 categories. Filter dynamically above or click any category section.
                        </small>
                     </div>
                  </div>
               </div>
            </div>

            <!-- Empty State Container when no search results match -->
            <div id="noMaterialFound" class="container text-center py-5" style="display: none;">
               <div class="no-material-box p-4">
                  <i class="fa fa-search text-warning fa-3x mb-3"></i>
                  <h3 class="text-white mb-2" style="font-weight: 700;">No Scrap Grades Found</h3>
                  <p class="text-muted mb-4" id="noMaterialMessage" style="max-width: 520px; margin: 0 auto 1.5rem;">
                     We couldn't find any material grades matching your search. Try searching by metal name (e.g. Copper, Steel, Aluminium, Brass), grade (304, HMS 1), or ISRI code.
                  </p>
                  <div class="d-flex justify-content-center gap-2 flex-wrap">
                     <button type="button" id="resetMaterialFilters" class="btn btn-warning font-weight-bold px-4 py-2" style="border-radius: 4px;">
                        <i class="fa fa-refresh mr-1"></i> Reset Filters &amp; View All
                     </button>
                  </div>
               </div>
            </div>

            <!-- Results Container: All 5 Category Blocks inside the same container -->
            <div id="catalogueResultsContainer" class="catalogue-results-wrap">
               <!-- =====================================================================
                    CATEGORY 1: FERROUS SCRAP
                    ===================================================================== -->
               <div id="sec-ferrous"></div>
               <div class="catalogue-category-block" id="ferrous-section" data-anchor-alias="sec-ferrous" data-category-section="ferrous">`;

// 3. Ferrous -> Non-Ferrous
const ferrousToNonFerrousTarget = `                        <div class="catalogue-card-footer">
                           <small class="text-muted">Min Volume: 3 MT</small>
                           <a href="contact.html#pickupSection" class="btn btn-sm btn-outline-warning">Request Collection &rarr;</a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <!-- =====================================================================
           SECTION 2: NON-FERROUS SCRAP
           ===================================================================== -->
      <div id="sec-nonferrous"></div><div id="sec-copper"></div><div id="sec-aluminium"></div><div id="sec-brass"></div>
      <section class="section-py section-surface pt-4" id="nonferrous-section" data-category-section="non-ferrous">
         <div class="container">`;

const ferrousToNonFerrousReplacement = `                        <div class="catalogue-card-footer">
                           <small class="text-muted">Min Volume: 3 MT</small>
                           <a href="contact.html#pickupSection" class="btn btn-sm btn-outline-warning">Request Collection &rarr;</a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <!-- =====================================================================
              CATEGORY 2: NON-FERROUS SCRAP
              ===================================================================== -->
         <div id="sec-nonferrous"></div><div id="sec-copper"></div><div id="sec-aluminium"></div><div id="sec-brass"></div>
         <div class="catalogue-category-block" id="nonferrous-section" data-category-section="non-ferrous">`;

// 4. Non-Ferrous -> Stainless
const nonFerrousToStainlessTarget = `                        <div class="catalogue-card-footer">
                           <small class="text-muted">Min Volume: 300 kg</small>
                           <a href="contact.html#pickupSection" class="btn btn-sm btn-outline-warning">Request Collection &rarr;</a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <!-- =====================================================================
           SECTION 3: STAINLESS STEEL SCRAP
           ===================================================================== -->
      <div id="sec-stainless"></div>
      <section class="section-py section-dark pt-4" id="stainless-section" data-category-section="stainless">
         <div class="container">`;

const nonFerrousToStainlessReplacement = `                        <div class="catalogue-card-footer">
                           <small class="text-muted">Min Volume: 300 kg</small>
                           <a href="contact.html#pickupSection" class="btn btn-sm btn-outline-warning">Request Collection &rarr;</a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <!-- =====================================================================
              CATEGORY 3: STAINLESS STEEL SCRAP
              ===================================================================== -->
         <div id="sec-stainless"></div>
         <div class="catalogue-category-block" id="stainless-section" data-category-section="stainless">`;

// 5. Stainless -> Electrical
const stainlessToElectricalTarget = `                        <div class="catalogue-card-footer">
                           <small class="text-muted">Min Volume: 100 kg</small>
                           <a href="contact.html#pickupSection" class="btn btn-sm btn-outline-warning">Request Collection &rarr;</a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <!-- =====================================================================
           SECTION 4: ELECTRICAL & CABLE SCRAP
           ===================================================================== -->
      <div id="sec-electrical"></div>
      <section class="section-py section-darker pt-4" id="electrical-section" data-category-section="electrical">
         <div class="container">`;

const stainlessToElectricalReplacement = `                        <div class="catalogue-card-footer">
                           <small class="text-muted">Min Volume: 100 kg</small>
                           <a href="contact.html#pickupSection" class="btn btn-sm btn-outline-warning">Request Collection &rarr;</a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <!-- =====================================================================
              CATEGORY 4: ELECTRICAL & CABLE SCRAP
              ===================================================================== -->
         <div id="sec-electrical"></div>
         <div class="catalogue-category-block" id="electrical-section" data-category-section="electrical">`;

// 6. Electrical -> Industrial
const electricalToIndustrialTarget = `                        <div class="catalogue-card-footer">
                           <small class="text-muted">Min Volume: 2 MT</small>
                           <a href="contact.html#pickupSection" class="btn btn-sm btn-outline-warning">Request Collection &rarr;</a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <!-- =====================================================================
           SECTION 5: INDUSTRIAL MIXED & PRODUCTION SCRAP
           ===================================================================== -->
      <div id="sec-industrial"></div>
      <section class="section-py section-surface pt-4" id="industrial-section" data-category-section="industrial">
         <div class="container">`;

const electricalToIndustrialReplacement = `                        <div class="catalogue-card-footer">
                           <small class="text-muted">Min Volume: 2 MT</small>
                           <a href="contact.html#pickupSection" class="btn btn-sm btn-outline-warning">Request Collection &rarr;</a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <!-- =====================================================================
              CATEGORY 5: INDUSTRIAL MIXED & PRODUCTION SCRAP
              ===================================================================== -->
         <div id="sec-industrial"></div>
         <div class="catalogue-category-block" id="industrial-section" data-category-section="industrial">`;

// 7. Industrial End -> Hub End
const industrialEndTarget = `                        <div class="catalogue-card-footer">
                           <small class="text-muted">Min Volume: 20 MT</small>
                           <a href="contact.html#pickupSection" class="btn btn-sm btn-outline-warning">Request Collection &rarr;</a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <!-- Home 1: Metallurgy Assurance & Ingestion Quality Strip -->`;

const industrialEndReplacement = `                        <div class="catalogue-card-footer">
                           <small class="text-muted">Min Volume: 20 MT</small>
                           <a href="contact.html#pickupSection" class="btn btn-sm btn-outline-warning">Request Collection &rarr;</a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</section>

      <!-- Home 1: Metallurgy Assurance & Ingestion Quality Strip -->`;

function apply(name, target, replacement) {
  if (!html.includes(target)) {
    console.error('Target not found for:', name);
    process.exit(1);
  }
  const count = html.split(target).length - 1;
  if (count !== 1) {
    console.error(`Target found ${count} times for: ${name}`);
    process.exit(1);
  }
  html = html.replace(target, replacement);
  console.log('Successfully applied:', name);
}

apply('Why Choose Us Extension', whyTarget, whyReplacement);
apply('Hub Start', hubStartTarget, hubStartReplacement);
apply('Ferrous to Non-Ferrous', ferrousToNonFerrousTarget, ferrousToNonFerrousReplacement);
apply('Non-Ferrous to Stainless', nonFerrousToStainlessTarget, nonFerrousToStainlessReplacement);
apply('Stainless to Electrical', stainlessToElectricalTarget, stainlessToElectricalReplacement);
apply('Electrical to Industrial', electricalToIndustrialTarget, electricalToIndustrialReplacement);
apply('Industrial End to Hub End', industrialEndTarget, industrialEndReplacement);

fs.writeFileSync('home-1.html', html, 'utf8');
console.log('home-1.html updated successfully.');
