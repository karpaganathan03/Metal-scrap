/**
 * FERROMAX INDUSTRIAL SCRAP & RECYCLING
 * Front-end Application Logic & Utilities
 * Vanilla JavaScript (No frameworks)
 */

document.addEventListener('DOMContentLoaded', function () {

  // 15. URL Query Parameter Handling & Contact Form Pre-Selection
  const urlParams = new URLSearchParams(window.location.search);
  const materialParam = urlParams.get('material');
  const contactCatSelect = document.getElementById('contactCategory');
  const contactFullName = document.getElementById('contactFullName');

  if (materialParam && contactCatSelect) {
    const paramLower = materialParam.toLowerCase().replace(/\+/g, ' ');
    for (let i = 0; i < contactCatSelect.options.length; i++) {
      const optText = contactCatSelect.options[i].text.toLowerCase();
      if (optText.includes(paramLower) || paramLower.includes(optText.split(' ')[1] || '---')) {
        contactCatSelect.selectedIndex = i;
        break;
      }
    }
  }

  // Auto-focus on Full Name when arriving with #pickupSection
  if (window.location.hash.includes('pickup') && contactFullName) {
    setTimeout(function () {
      const pickupSection = document.getElementById('pickupSection');
      if (pickupSection) {
        pickupSection.scrollIntoView({ behavior: 'smooth' });
      }
      contactFullName.focus();
    }, 350);
  }

  // 16. Universal Smooth Scroll for Anchor Links (Internal CTAs)
  document.querySelectorAll('a[href*="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href) return;
      
      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;
      
      const pathPart = href.substring(0, hashIndex);
      const hashPart = href.substring(hashIndex);

      // If current page or empty pathPart
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      if (!pathPart || pathPart === currentPath) {
        const targetElement = document.querySelector(hashPart);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
          if (history.pushState) {
            history.pushState(null, null, hashPart);
          } else {
            window.location.hash = hashPart;
          }
          if (hashPart === '#pickupSection' && contactFullName) {
            setTimeout(function () { contactFullName.focus(); }, 400);
          }
        }
      }
    });
  });

  'use strict';

  // 1. Smooth Page Initialization
  document.body.classList.add('page-loaded');

  // 2. Sticky Header with Scroll Effect
  const header = document.querySelector('.header');
  window.addEventListener('scroll', function () {
    if (header) {
      if (window.scrollY > 40) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }
  });

  // 3. Sidepanel Mobile Navigation
  const openBtn = document.querySelectorAll('.openbtn-custom, .openbtn');
  const closeBtn = document.querySelectorAll('.sidepanel-close, .closebtn');
  const sidepanel = document.getElementById('mySidepanel');
  const overlay = document.querySelector('.sidepanel-overlay');

  function openNavigation() {
    if (sidepanel) {
      sidepanel.classList.add('open');
      sidepanel.style.width = '';
    }
    if (overlay) {
      overlay.classList.add('show');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeNavigation() {
    if (sidepanel) {
      sidepanel.classList.remove('open');
      sidepanel.style.width = '';
    }
    if (overlay) {
      overlay.classList.remove('show');
    }
    document.body.style.overflow = '';
  }

  openBtn.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openNavigation();
    });
  });

  closeBtn.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      closeNavigation();
    });
  });

  // Automatically close mobile sidepanel on link click
  document.querySelectorAll('.sidepanel-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      closeNavigation();
    });
  });

  if (overlay) {
    overlay.addEventListener('click', closeNavigation);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeNavigation();
    }
  });

  // Expose to window for inline onclick fallback
  window.openNav = openNavigation;
  window.closeNav = closeNavigation;

  // 4. Material Hub Filtering & Search
  const filterButtons = document.querySelectorAll('.filter-btn-chip');
  const materialCards = document.querySelectorAll('.material-card-item');
  const materialSearch = document.getElementById('materialSearchInput');
  const noMaterialFound = document.getElementById('noMaterialFound');

  function filterMaterials() {
    const activeBtn = document.querySelector('.filter-btn-chip.active');
    const selectedCategory = activeBtn ? activeBtn.getAttribute('data-category') : 'all';
    const searchQuery = materialSearch ? materialSearch.value.toLowerCase().trim() : '';
    let visibleCount = 0;

    materialCards.forEach(function (card) {
      const cardCategory = card.getAttribute('data-category');
      const cardText = card.textContent.toLowerCase();

      const matchesCategory = selectedCategory === 'all' || cardCategory === selectedCategory;
      const matchesSearch = !searchQuery || cardText.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'block';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noMaterialFound) {
      noMaterialFound.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  if (filterButtons.length > 0) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterButtons.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        filterMaterials();
      });
    });
  }

  if (materialSearch) {
    materialSearch.addEventListener('input', filterMaterials);
  }

  // 5. Rate Card Search & Category Filtering
  const rateSearchInput = document.getElementById('rateSearchInput');
  const rateCategorySelect = document.getElementById('rateCategoryFilter');

  function filterRates() {
    const query = rateSearchInput ? rateSearchInput.value.toLowerCase().trim() : '';
    const selectedCat = rateCategorySelect ? rateCategorySelect.value : 'all';
    const rateRows = document.querySelectorAll('.rate-table-row');

    rateRows.forEach(function (row) {
      const rowCat = row.getAttribute('data-category');
      const rowText = row.textContent.toLowerCase();

      const matchesCat = selectedCat === 'all' || rowCat === selectedCat;
      const matchesQuery = !query || rowText.includes(query);

      if (matchesCat && matchesQuery) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });

    // Check rate category section containers
    const categorySections = document.querySelectorAll('.rate-category-section');
    categorySections.forEach(function (sec) {
      const secCat = sec.getAttribute('data-section-cat');
      const secRows = sec.querySelectorAll('.rate-table-row');
      let visibleRowCount = 0;
      secRows.forEach(function (r) {
        if (r.style.display !== 'none') visibleRowCount++;
      });
      const matchesCategorySelection = selectedCat === 'all' || secCat === selectedCat;
      sec.style.display = (matchesCategorySelection && visibleRowCount > 0) ? '' : 'none';
    });
  }

  if (rateSearchInput) {
    rateSearchInput.addEventListener('input', filterRates);
  }

  if (rateCategorySelect) {
    rateCategorySelect.addEventListener('change', filterRates);
  }

  // 6. Rate Card Unit Toggle (Metric Ton vs Kilogram vs Pound)
  const unitButtons = document.querySelectorAll('.btn-unit-toggle');
  if (unitButtons.length > 0) {
    unitButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        unitButtons.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        const unit = this.getAttribute('data-unit'); // 'mt', 'kg', 'lb'

        // Update rate display strings (INR Currency Formatting)
        document.querySelectorAll('.rate-display-value').forEach(function (el) {
          const mtPrice = parseFloat(el.getAttribute('data-rate-mt'));
          const mtPriceHigh = parseFloat(el.getAttribute('data-rate-mt-high') || mtPrice);

          if (!isNaN(mtPrice)) {
            if (unit === 'kg') {
              const kgLow = (mtPrice / 1000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              const kgHigh = (mtPriceHigh / 1000).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              el.textContent = kgLow === kgHigh ? '₹' + kgLow + ' / kg' : '₹' + kgLow + ' - ₹' + kgHigh + ' / kg';
            } else if (unit === 'lb') {
              const lbLow = (mtPrice / 2204.62).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              const lbHigh = (mtPriceHigh / 2204.62).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              el.textContent = lbLow === lbHigh ? '₹' + lbLow + ' / lb' : '₹' + lbLow + ' - ₹' + lbHigh + ' / lb';
            } else {
              el.textContent = '₹' + mtPrice.toLocaleString('en-IN') + ' - ₹' + mtPriceHigh.toLocaleString('en-IN') + ' / TON';
            }
          }
        });

        // Update rate-unit-label badges
        document.querySelectorAll('.rate-unit-label').forEach(function (lbl) {
          if (unit === 'kg') lbl.textContent = 'KG';
          else if (unit === 'lb') lbl.textContent = 'LB';
          else lbl.textContent = 'TON';
        });
      });
    });
  }

  // 7. Interactive Scrap Valuation Calculator
  const calcCategory = document.getElementById('calcCategory');
  const calcMaterial = document.getElementById('calcMaterial');
  const calcWeight = document.getElementById('calcWeight');
  const calcWeightUnit = document.getElementById('calcWeightUnit');
  const calcCondition = document.getElementById('calcCondition');
  const calcOutput = document.getElementById('calcOutput');
  const calcContainerRec = document.getElementById('calcContainerRec');

    const materialPrices = {
    // 1. Ferrous (₹/MT - 1 USD = 85 INR)
    'hms1': { name: 'Heavy Melting Steel (HMS 1)', cat: 'ferrous', low: 27200, high: 29325 },
    'hms2': { name: 'Heavy Melting Steel (HMS 2)', cat: 'ferrous', low: 25075, high: 27200 },
    'shredded': { name: 'Shredded Steel Scrap (ISRI 211)', cat: 'ferrous', low: 28900, high: 31025 },
    'plate_structural': { name: 'Plate & Structural Steel (P&S)', cat: 'ferrous', low: 29750, high: 32300 },
    'busheling': { name: 'No. 1 Busheling Factory Clips', cat: 'ferrous', low: 31025, high: 33575 },
    // 2. Non-Ferrous (₹/MT)
    'titanium': { name: 'Titanium Grade 5 (6Al-4V) Solids', cat: 'non-ferrous', low: 408000, high: 527000 },
    'lead_soft': { name: 'Soft Sheet Lead & Pipe Scrap', cat: 'non-ferrous', low: 80750, high: 97750 },
    'zinc_clean': { name: 'Clean Zinc Die Cast Scrap', cat: 'non-ferrous', low: 106250, high: 123250 },
    'inconel_625': { name: 'Inconel 625 / 718 Superalloy', cat: 'non-ferrous', low: 1190000, high: 1402500 },
    'monel_400': { name: 'Monel 400 Nickel Alloy Solids', cat: 'non-ferrous', low: 935000, high: 1105000 },
    // 3. Copper Scrap (₹/MT)
    'copper_bare': { name: 'Bare Bright Copper (Millberry 99.9%)', cat: 'copper', low: 646000, high: 688500 },
    'copper_1': { name: 'No. 1 Clean Copper Tubing & Busbar', cat: 'copper', low: 612000, high: 654500 },
    'copper_2': { name: 'No. 2 Mixed Copper Scrap', cat: 'copper', low: 561000, high: 603500 },
    'cable_hv': { name: 'High-Voltage Armored Power Cable (70% Cu)', cat: 'copper', low: 433500, high: 476000 },
    'wire_bldg': { name: 'Industrial Building Wire (45% Cu)', cat: 'copper', low: 272000, high: 310250 },
    // 4. Aluminium Scrap (₹/MT)
    'alu_6063': { name: 'Clean 6063 Architectural Extrusions', cat: 'aluminium', low: 165750, high: 187000 },
    'alu_wheels': { name: 'Clean Cast Aluminum Rims / Wheels', cat: 'aluminium', low: 157250, high: 178500 },
    'alu_ubc': { name: 'Aluminum Used Beverage Cans (UBC Bales)', cat: 'aluminium', low: 114750, high: 131750 },
    'alu_sheet': { name: 'Mixed Aluminum Sheet & Siding (Low-Fe)', cat: 'aluminium', low: 106250, high: 123250 },
    'alu_turnings': { name: 'Clean Aluminum Borings & Turnings', cat: 'aluminium', low: 89250, high: 106250 },
    // 5. Brass Scrap (₹/MT)
    'brass_yellow': { name: 'Clean Yellow Brass Scrap (Honey)', cat: 'brass', low: 374000, high: 408000 },
    'brass_red': { name: 'Red Brass & Commercial Bronze Bushings', cat: 'brass', low: 433500, high: 476000 },
    'brass_turnings': { name: 'Brass Machine Turnings & Borings', cat: 'brass', low: 323000, high: 357000 },
    'brass_valves': { name: 'Clean Brass Plumbing Valves & Cocks', cat: 'brass', low: 357000, high: 391000 },
    // 6. Stainless Steel Scrap (₹/MT)
    'ss_304': { name: 'Stainless Steel 304 Solids & Sheet (18/8)', cat: 'stainless', low: 110500, high: 125800 },
    'ss_316': { name: 'Stainless Steel 316 Marine Grade Solids', cat: 'stainless', low: 161500, high: 182750 },
    'ss_duplex': { name: 'Duplex Stainless Steel 2205 Solids', cat: 'stainless', low: 187000, high: 216750 },
    'ss_turnings': { name: 'Clean Stainless Steel 304 Turnings', cat: 'stainless', low: 89250, high: 103700 },
    // 7. Iron and Steel Scrap (₹/MT)
    'cast_rotors': { name: 'Foundry Cast Iron Rotors & Drums', cat: 'iron-steel', low: 26350, high: 28475 },
    'cast_machinery': { name: 'Heavy Machinery Cast Iron Scrap', cat: 'iron-steel', low: 25500, high: 28050 },
    'cast_pipe': { name: 'Cast Iron Soil Pipe & Water Mains', cat: 'iron-steel', low: 23800, high: 26350 },
    'rebar_steel': { name: 'Heavy Reinforcing Bar (Rebar) Scrap', cat: 'iron-steel', low: 26775, high: 28900 },
    'turnings_steel': { name: 'Clean Steel Machine Turnings', cat: 'iron-steel', low: 17850, high: 20400 },
    // 8. Industrial Mixed Scrap (₹/MT)
    'machinery_mixed': { name: 'Obsolete Industrial Machinery & Gearboxes', cat: 'industrial-mixed', low: 20400, high: 23800 },
    'demolition_steel': { name: 'Structural Demolition Skeleton Scrap', cat: 'industrial-mixed', low: 22100, high: 25075 },
    'electric_motors': { name: 'Electric Motors & Stators (ISRI Elmo)', cat: 'industrial-mixed', low: 55250, high: 72250 },
    'transformers_dry': { name: 'Industrial Dry Transformers (Cu Core)', cat: 'industrial-mixed', low: 72250, high: 102000 },
    'factory_mixed': { name: 'Heavy Mixed Factory Production Offcuts', cat: 'industrial-mixed', low: 23800, high: 27200 }
  };

  function updateMaterialOptions() {
    if (!calcCategory || !calcMaterial) return;
    const cat = calcCategory.value;
    calcMaterial.innerHTML = '<option value="">-- Select Specific Scrap Grade --</option>';

    for (const key in materialPrices) {
      if (cat === 'all' || materialPrices[key].cat === cat) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = materialPrices[key].name;
        calcMaterial.appendChild(opt);
      }
    }
  }

  function calculateScrapValuation() {
    if (!calcMaterial || !calcWeight || !calcOutput) return;
    const selectedKey = calcMaterial.value;
    const weightVal = parseFloat(calcWeight.value);

    if (!selectedKey || isNaN(weightVal) || weightVal <= 0) {
      calcOutput.textContent = '₹0 - ₹0';
      if (calcContainerRec) calcContainerRec.textContent = 'Enter weight to see recommended logistics';
      return;
    }

    const data = materialPrices[selectedKey];
    let weightInMT = weightVal;
    const unit = calcWeightUnit ? calcWeightUnit.value : 'mt';

    if (unit === 'kg') {
      weightInMT = weightVal / 1000;
    } else if (unit === 'lb') {
      weightInMT = weightVal / 2204.62;
    }

    // Condition deduction or volume bonus
    let conditionFactor = 1.0;
    if (calcCondition) {
      if (calcCondition.value === 'clean') conditionFactor = 1.03; // premium for clean
      if (calcCondition.value === 'light_contamination') conditionFactor = 0.94;
      if (calcCondition.value === 'heavy_mixed') conditionFactor = 0.85;
    }

    // Volume incentive
    let volumeBonus = 1.0;
    if (weightInMT >= 20) volumeBonus = 1.05; // 5% bonus for high tonnage
    else if (weightInMT >= 10) volumeBonus = 1.03;

    const totalLow = Math.round(data.low * weightInMT * conditionFactor * volumeBonus);
    const totalHigh = Math.round(data.high * weightInMT * conditionFactor * volumeBonus);

    calcOutput.textContent = '₹' + Math.round(totalLow).toLocaleString('en-IN') + ' - ₹' + Math.round(totalHigh).toLocaleString('en-IN');

    // Container Recommendation
    if (calcContainerRec) {
      if (weightInMT < 2) {
        calcContainerRec.innerHTML = '<i class="fa fa-truck"></i> Recommended Logistics: <strong>Lugger Box or Self-Haul Drop-off</strong>';
      } else if (weightInMT <= 8) {
        calcContainerRec.innerHTML = '<i class="fa fa-truck"></i> Recommended Logistics: <strong>20-Yard Heavy Duty Roll-Off Bin</strong>';
      } else if (weightInMT <= 18) {
        calcContainerRec.innerHTML = '<i class="fa fa-truck"></i> Recommended Logistics: <strong>30-Yard or 40-Yard Industrial Container</strong>';
      } else {
        calcContainerRec.innerHTML = '<i class="fa fa-ship"></i> Recommended Logistics: <strong>Dedicated 50-Yard High-Volume Fleet / Gondola Rail Car</strong>';
      }
    }
  }

  if (calcCategory) {
    calcCategory.addEventListener('change', function () {
      updateMaterialOptions();
      calculateScrapValuation();
    });
    updateMaterialOptions();
  }

  if (calcMaterial) calcMaterial.addEventListener('change', calculateScrapValuation);
  if (calcWeight) calcWeight.addEventListener('input', calculateScrapValuation);
  if (calcWeightUnit) calcWeightUnit.addEventListener('change', calculateScrapValuation);
  if (calcCondition) calcCondition.addEventListener('change', calculateScrapValuation);

  // 8. Contact & Pickup Form Handling with Strict Client-Side Validation
  const pickupForm = document.getElementById('pickupEnquiryForm');
  const quoteModal = document.getElementById('quoteModal');
  const quoteModalClose = document.getElementById('quoteModalClose');

  if (pickupForm) {
    const fullNameInput = document.getElementById('contactFullName') || document.getElementById('contactName');
    const mobileInput = document.getElementById('contactMobile') || document.getElementById('contactPhone');
    const emailInput = document.getElementById('contactEmail');
    const categorySelect = document.getElementById('contactCategory') || document.getElementById('contactMaterial');
    const quantityInput = document.getElementById('contactQuantity') || document.getElementById('contactTonnage');
    const locationInput = document.getElementById('contactLocation') || document.getElementById('contactAddress');
    const messageInput = document.getElementById('contactMessage') || document.getElementById('contactNotes');

    function showError(inputEl, errorElId, message) {
      if (inputEl) {
        inputEl.classList.add('is-invalid');
        inputEl.classList.remove('is-valid');
      }
      const errEl = document.getElementById(errorElId);
      if (errEl) {
        errEl.innerHTML = '<i class="fa fa-exclamation-circle"></i> ' + message;
        errEl.style.display = 'block';
      }
    }

    function clearError(inputEl, errorElId) {
      if (inputEl) {
        inputEl.classList.remove('is-invalid');
        inputEl.classList.add('is-valid');
      }
      const errEl = document.getElementById(errorElId);
      if (errEl) {
        errEl.innerHTML = '';
        errEl.style.display = 'none';
      }
    }

    // Real-time clearance listeners
    if (fullNameInput) {
      fullNameInput.addEventListener('input', function () {
        if (fullNameInput.value.trim().length >= 4) {
          clearError(fullNameInput, 'errFullName');
        }
      });
    }

    if (mobileInput) {
      mobileInput.addEventListener('input', function () {
        const digits = mobileInput.value.replace(/\D/g, '');
        if (digits.length === 10) {
          clearError(mobileInput, 'errMobile');
        }
      });
    }

    if (emailInput) {
      emailInput.addEventListener('input', function () {
        const val = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!val || emailRegex.test(val)) {
          clearError(emailInput, 'errEmail');
        }
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', function () {
        if (categorySelect.value) {
          clearError(categorySelect, 'errCategory');
        }
      });
    }

    if (quantityInput) {
      quantityInput.addEventListener('input', function () {
        if (quantityInput.value.trim().length > 0) {
          clearError(quantityInput, 'errQuantity');
        }
      });
    }

    if (locationInput) {
      locationInput.addEventListener('input', function () {
        if (locationInput.value.trim().length >= 4) {
          clearError(locationInput, 'errLocation');
        }
      });
    }

    pickupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let isValid = true;
      let firstInvalid = null;

      // 1. Full Name (min 4 characters)
      const nameVal = fullNameInput ? fullNameInput.value.trim() : '';
      if (!nameVal || nameVal.length < 4) {
        showError(fullNameInput, 'errFullName', 'Full Name must contain at least 4 characters.');
        isValid = false;
        if (!firstInvalid) firstInvalid = fullNameInput;
      } else {
        clearError(fullNameInput, 'errFullName');
      }

      // 2. Mobile Number (must accept exactly 10 digits)
      const mobileVal = mobileInput ? mobileInput.value.trim() : '';
      const digitsOnly = mobileVal.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        showError(mobileInput, 'errMobile', 'Mobile Number must accept exactly 10 digits (e.g. 9876543210 or 5550192834).');
        isValid = false;
        if (!firstInvalid) firstInvalid = mobileInput;
      } else {
        clearError(mobileInput, 'errMobile');
      }

      // 3. Email Address (valid email format when provided)
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal) {
        showError(emailInput, 'errEmail', 'Please enter your email address.');
        isValid = false;
        if (!firstInvalid) firstInvalid = emailInput;
      } else if (!emailRegex.test(emailVal)) {
        showError(emailInput, 'errEmail', 'Please enter a valid email format (e.g., name@domain.com).');
        isValid = false;
        if (!firstInvalid) firstInvalid = emailInput;
      } else {
        clearError(emailInput, 'errEmail');
      }

      // 4. Material Category (required)
      const categoryVal = categorySelect ? categorySelect.value : '';
      if (!categoryVal) {
        showError(categorySelect, 'errCategory', 'Please select an accepted scrap material category.');
        isValid = false;
        if (!firstInvalid) firstInvalid = categorySelect;
      } else {
        clearError(categorySelect, 'errCategory');
      }

      // 5. Estimated Scrap Quantity (required)
      const quantityVal = quantityInput ? quantityInput.value.trim() : '';
      if (!quantityVal) {
        showError(quantityInput, 'errQuantity', 'Please enter estimated scrap quantity (e.g. 10 Metric Tons).');
        isValid = false;
        if (!firstInvalid) firstInvalid = quantityInput;
      } else {
        clearError(quantityInput, 'errQuantity');
      }

      // 6. Pickup Location (required, min 4 characters)
      const locationVal = locationInput ? locationInput.value.trim() : '';
      if (!locationVal || locationVal.length < 4) {
        showError(locationInput, 'errLocation', 'Please provide a valid facility pickup address.');
        isValid = false;
        if (!firstInvalid) firstInvalid = locationInput;
      } else {
        clearError(locationInput, 'errLocation');
      }

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Form is 100% valid! Generate client-side reference tracking code
      const refNumber = 'FXR-' + Math.floor(100000 + Math.random() * 900000);

      // Populate confirmation modal fields
      const modalRef = document.getElementById('modalRefCode');
      const modalName = document.getElementById('modalClientName');
      const modalSummary = document.getElementById('modalScrapSummary');
      const modalLocation = document.getElementById('modalClientLocation');

      if (modalRef) modalRef.textContent = refNumber;
      if (modalName) modalName.textContent = nameVal;
      if (modalSummary) modalSummary.textContent = categoryVal + ' (~' + quantityVal + ')';
      if (modalLocation) modalLocation.textContent = locationVal;

      // Update and reveal inline success banner
      const banner = document.getElementById('formSuccessBanner');
      const bannerRef = document.getElementById('bannerRefCode');
      if (bannerRef) bannerRef.textContent = refNumber;
      if (banner) {
        banner.style.display = 'block';
        banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (quoteModal) {
        quoteModal.style.display = 'flex';
      }
    });
  }

  if (quoteModalClose) {
    quoteModalClose.addEventListener('click', function () {
      if (quoteModal) quoteModal.style.display = 'none';
      if (pickupForm) {
        pickupForm.reset();
        document.querySelectorAll('.form-control-industrial').forEach(function (el) {
          el.classList.remove('is-valid');
          el.classList.remove('is-invalid');
        });
      }
    });
  }

  // 13. Dark Mode & Light Mode Theme Toggle with localStorage Persistence
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');

  function getSavedTheme() {
    return localStorage.getItem('ferromax_theme') || 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('ferromax_theme', theme);

    themeToggleBtns.forEach(function (btn) {
      if (theme === 'light') {
        btn.setAttribute('title', 'Switch to Dark Mode');
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
      } else {
        btn.setAttribute('title', 'Switch to Light Mode');
        btn.setAttribute('aria-label', 'Switch to Light Mode');
      }
    });
  }

  // Apply saved theme on initial load
  applyTheme(getSavedTheme());

  themeToggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  });

  // 14. RTL & LTR Layout Toggle with localStorage Persistence
  const dirToggleBtns = document.querySelectorAll('.dir-toggle-btn');

  function getSavedDir() {
    return localStorage.getItem('ferromax_dir') || 'ltr';
  }

  function applyDirection(dir) {
    document.documentElement.setAttribute('dir', dir);
    if (document.body) {
      document.body.setAttribute('dir', dir);
    }
    localStorage.setItem('ferromax_dir', dir);

    dirToggleBtns.forEach(function (btn) {
      const badge = btn.querySelector('.dir-indicator-badge');
      if (dir === 'rtl') {
        if (badge) badge.textContent = 'LTR';
        btn.setAttribute('title', 'Switch to Left-to-Right (LTR) Layout');
        btn.setAttribute('aria-label', 'Switch to Left-to-Right (LTR) Layout');
      } else {
        if (badge) badge.textContent = 'RTL';
        btn.setAttribute('title', 'Switch to Right-to-Left (RTL) Layout');
        btn.setAttribute('aria-label', 'Switch to Right-to-Left (RTL) Layout');
      }
    });
  }

  // Apply saved direction on initial load
  applyDirection(getSavedDir());

  dirToggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      applyDirection(newDir);
    });
  });

  // 9. Yard Location Selector (contact.html)
  const yardTabs = document.querySelectorAll('.yard-selector-tab');
  const yardPanels = document.querySelectorAll('.yard-location-panel');

  if (yardTabs.length > 0) {
    yardTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        yardTabs.forEach(function (t) { t.classList.remove('active'); });
        yardPanels.forEach(function (p) { p.classList.remove('active'); p.style.display = 'none'; });

        this.classList.add('active');
        const yardId = this.getAttribute('data-yard');
        const targetPanel = document.getElementById(yardId);
        if (targetPanel) {
          targetPanel.classList.add('active');
          targetPanel.style.display = 'block';
        }
      });
    });
  }

  // 10. FAQ Accordion Toggle
  const faqHeaders = document.querySelectorAll('.faq-header');
  faqHeaders.forEach(function (header) {
    header.addEventListener('click', function () {
      const parent = this.parentElement;
      const body = parent.querySelector('.faq-body');
      const isActive = this.classList.contains('active');

      // Close other FAQs
      faqHeaders.forEach(function (h) {
        h.classList.remove('active');
        if (h.parentElement.querySelector('.faq-body')) {
          h.parentElement.querySelector('.faq-body').style.display = 'none';
        }
      });

      if (!isActive && body) {
        this.classList.add('active');
        body.style.display = 'block';
      }
    });
  });

  // 11. Print Rate Card
  const printBtn = document.getElementById('btnPrintRateCard');
  if (printBtn) {
    printBtn.addEventListener('click', function () {
      window.print();
    });
  }

  // 12. Carbon Savings Live Counter (Process page)
  const carbonCounter = document.getElementById('co2SavedCounter');
  if (carbonCounter) {
    let startVal = 142850;
    setInterval(function () {
      startVal += Math.floor(Math.random() * 3) + 1;
      carbonCounter.textContent = startVal.toLocaleString() + ' MT';
    }, 4000);
  }

  // 14. Footer Scroll-to-Top Button Handler
  const scrollTopBtns = document.querySelectorAll('.footer-scroll-top-btn');
  scrollTopBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  });

});
