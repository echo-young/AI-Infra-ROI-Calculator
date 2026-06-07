const GPUS_PER_SERVER = 8;
const MANAGEMENT_PORTS_PER_SWITCH = 48;

const gpuCatalog = {
  h100: {
    name: "NVIDIA H100",
    denseFp16Tflops: 989,
    defaultIbSpeed: 400,
    ibPortsPerServer: 8,
    serverPriceWan: 260,
    kwPerServer: 10.2,
    fabricHint: "H100 训练集群建议优先使用 400G NDR InfiniBand。",
  },
  h200: {
    name: "NVIDIA H200",
    denseFp16Tflops: 989,
    defaultIbSpeed: 400,
    ibPortsPerServer: 8,
    serverPriceWan: 300,
    kwPerServer: 10.5,
    fabricHint: "H200 通常延续 H100 级训练网络口径，重点关注显存容量与数据集吞吐。",
  },
  b200: {
    name: "NVIDIA B200",
    denseFp16Tflops: 2250,
    defaultIbSpeed: 800,
    ibPortsPerServer: 8,
    serverPriceWan: 420,
    kwPerServer: 14.3,
    fabricHint: "B200 建议优先规划 800G IB 上联和更高机柜功率余量。",
  },
  b300: {
    name: "NVIDIA B300",
    denseFp16Tflops: 4500,
    defaultIbSpeed: 800,
    ibPortsPerServer: 8,
    serverPriceWan: 520,
    kwPerServer: 20,
    fabricHint: "B300 第一版按高密 8GPU 模组估算，建议把供电、散热和扩容作为强约束。",
  },
};

const defaults = {
  projectName: "AI 算力中心一期建设",
  location: "华东区域 IDC",
  computeRoute: "nvidia",
  workload: "training",
  years: 3,
  revenueMode: "lease",
  gpuModel: "h100",
  clusterSizingMode: "auto",
  serverCount: 16,
  modelScale: "medium",
  inferenceScale: "medium",
  serverUnitPrice: 260,
  kwPerServer: 10.2,
  ibPortSpeed: "auto",
  convergenceRatio: "auto",
  leafSwitchPrice: 70,
  spineSwitchPrice: 80,
  ibCableUnitPrice: 0.9,
  managementSwitchPrice: 3.5,
  expansionPlan: "standard",
  costSensitivity: "balanced",
  managementNodes: 3,
  storageScope: "excluded",
  hotStorageTb: 800,
  coldStorageTb: 1600,
  hotStoragePrice: 0.65,
  coldStoragePrice: 0.18,
  softwareCost: 180,
  integrationRate: 5,
  spareRate: 2,
  rackBillingMode: "rack",
  rackPowerKw: 30,
  rackCount: 12,
  rackRent: 1.8,
  rackPackagePrice: 900,
  pue: 1.35,
  powerPrice: 0.82,
  loadRate: 65,
  networkOpex: 96,
  opsCost: 180,
  otherOpex: 48,
  deviceMonthlyRent: 18,
  deviceLeaseRate: 58,
  constructionSubsidy: 300,
  constructionSubsidyRate: 80,
  constructionSubsidyYear: 1,
  equipmentSubsidy: 0,
  equipmentSubsidyRate: 70,
  equipmentSubsidyYear: 1,
  annualVoucher: 120,
  voucherRedeemRate: 75,
  voucherStartYear: 1,
  rackSubsidy: 0,
  rackSubsidyRate: 80,
  rackSubsidyStartYear: 1,
  loanInterestSubsidy: 0,
  loanInterestSubsidyRate: 70,
  loanInterestSubsidyStartYear: 1,
  taxIncentive: 0,
  taxIncentiveRate: 70,
  taxIncentiveStartYear: 1,
};

const textMaps = {
  computeRoute: {
    nvidia: "NVIDIA 算力",
    domestic: "国产算力",
    hybrid: "混合算力",
  },
  workload: {
    training: "训练优先",
    inference: "推理优先",
    mixed: "混合负载",
  },
  revenueMode: {
    lease: "裸设备租赁服务",
    saving: "租赁 + 算力券协同",
  },
  modelScale: {
    small: "300B-800B / 大模型推理与轻量训练",
    medium: "800B-1.6T / 旗舰模型中等训练",
    large: "1.6T+ / 万亿级预训练",
  },
  inferenceScale: {
    low: "单模型试点 / 内部业务低并发",
    medium: "多业务上线 / 多租户中并发",
    high: "核心生产服务 / 低延迟 SLA",
  },
  expansionPlan: {
    fixed: "规模固定",
    standard: "常规扩容",
    aggressive: "快速扩容",
  },
  costSensitivity: {
    low: "性能优先",
    balanced: "均衡",
    high: "成本优先",
  },
};

const inputIds = Object.keys(defaults);

function numberValue(id) {
  const value = document.getElementById(id).value;
  return Number(value) || 0;
}

function textValue(id) {
  return document.getElementById(id).value.trim();
}

function moneyWan(value) {
  return `${Math.round(value).toLocaleString("zh-CN")} 万元`;
}

function moneyYuan(value) {
  return `${value.toFixed(2)} 元`;
}

function percent(value) {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(1)}%`;
}

function formatPf16(tflops) {
  if (tflops >= 1000) return `${(tflops / 1000).toFixed(1)} PFLOPS`;
  return `${Math.round(tflops).toLocaleString("zh-CN")} TFLOPS`;
}

function buildState() {
  return {
    projectName: textValue("projectName"),
    location: textValue("location"),
    computeRoute: textValue("computeRoute"),
    workload: textValue("workload"),
    years: numberValue("years"),
    revenueMode: textValue("revenueMode"),
    gpuModel: textValue("gpuModel"),
    clusterSizingMode: textValue("clusterSizingMode"),
    serverCount: numberValue("serverCount"),
    modelScale: textValue("modelScale"),
    inferenceScale: textValue("inferenceScale"),
    serverUnitPrice: numberValue("serverUnitPrice"),
    kwPerServer: numberValue("kwPerServer"),
    ibPortSpeed: textValue("ibPortSpeed"),
    convergenceRatio: textValue("convergenceRatio"),
    leafSwitchPrice: numberValue("leafSwitchPrice"),
    spineSwitchPrice: numberValue("spineSwitchPrice"),
    ibCableUnitPrice: numberValue("ibCableUnitPrice"),
    managementSwitchPrice: numberValue("managementSwitchPrice"),
    expansionPlan: textValue("expansionPlan"),
    costSensitivity: textValue("costSensitivity"),
    managementNodes: numberValue("managementNodes"),
    storageScope: textValue("storageScope"),
    hotStorageTb: numberValue("hotStorageTb"),
    coldStorageTb: numberValue("coldStorageTb"),
    hotStoragePrice: numberValue("hotStoragePrice"),
    coldStoragePrice: numberValue("coldStoragePrice"),
    softwareCost: numberValue("softwareCost"),
    integrationRate: numberValue("integrationRate") / 100,
    spareRate: numberValue("spareRate") / 100,
    rackBillingMode: textValue("rackBillingMode"),
    rackPowerKw: numberValue("rackPowerKw"),
    rackCount: numberValue("rackCount"),
    rackRent: numberValue("rackRent"),
    rackPackagePrice: numberValue("rackPackagePrice"),
    pue: numberValue("pue"),
    powerPrice: numberValue("powerPrice"),
    loadRate: numberValue("loadRate") / 100,
    networkOpex: numberValue("networkOpex"),
    opsCost: numberValue("opsCost"),
    otherOpex: numberValue("otherOpex"),
    deviceMonthlyRent: numberValue("deviceMonthlyRent"),
    deviceLeaseRate: numberValue("deviceLeaseRate") / 100,
    constructionSubsidy: numberValue("constructionSubsidy"),
    constructionSubsidyRate: numberValue("constructionSubsidyRate") / 100,
    constructionSubsidyYear: numberValue("constructionSubsidyYear"),
    equipmentSubsidy: numberValue("equipmentSubsidy"),
    equipmentSubsidyRate: numberValue("equipmentSubsidyRate") / 100,
    equipmentSubsidyYear: numberValue("equipmentSubsidyYear"),
    annualVoucher: numberValue("annualVoucher"),
    voucherRedeemRate: numberValue("voucherRedeemRate") / 100,
    voucherStartYear: numberValue("voucherStartYear"),
    rackSubsidy: numberValue("rackSubsidy"),
    rackSubsidyRate: numberValue("rackSubsidyRate") / 100,
    rackSubsidyStartYear: numberValue("rackSubsidyStartYear"),
    loanInterestSubsidy: numberValue("loanInterestSubsidy"),
    loanInterestSubsidyRate: numberValue("loanInterestSubsidyRate") / 100,
    loanInterestSubsidyStartYear: numberValue("loanInterestSubsidyStartYear"),
    taxIncentive: numberValue("taxIncentive"),
    taxIncentiveRate: numberValue("taxIncentiveRate") / 100,
    taxIncentiveStartYear: numberValue("taxIncentiveStartYear"),
  };
}

function recommendServerCount(state) {
  const trainingMap = { small: 32, medium: 128, large: 256 };
  const inferenceMap = { low: 16, medium: 64, high: 128 };
  let base;

  if (state.workload === "training") {
    base = trainingMap[state.modelScale];
  } else if (state.workload === "inference") {
    base = inferenceMap[state.inferenceScale];
  } else {
    base = Math.max(trainingMap[state.modelScale] * 0.75, inferenceMap[state.inferenceScale]);
  }

  if (state.expansionPlan === "aggressive") base *= 1.5;
  if (state.expansionPlan === "fixed") base *= 0.75;
  if (state.costSensitivity === "high") base *= 0.75;
  if (state.costSensitivity === "low") base *= 1.25;

  const singleClusterCap = state.workload === "inference" ? 128 : 256;
  base = Math.min(base, singleClusterCap);

  const rounded = Math.max(2, Math.ceil(base / 2) * 2);
  return rounded;
}

function getDesignInputs(state) {
  const gpu = gpuCatalog[state.gpuModel];
  const recommendedServers = recommendServerCount(state);
  const servers = state.clusterSizingMode === "auto" ? recommendedServers : Math.max(1, state.serverCount);
  const ibSpeed = state.ibPortSpeed === "auto" ? gpu.defaultIbSpeed : Number(state.ibPortSpeed);
  let ratio;
  if (state.convergenceRatio === "auto") {
    ratio = state.workload === "inference" || state.costSensitivity === "high" ? 2 : 1;
  } else {
    ratio = Number(state.convergenceRatio);
  }

  return { gpu, recommendedServers, servers, ibSpeed, ratio };
}

function calculateFabric(state) {
  const { gpu, recommendedServers, servers, ibSpeed, ratio } = getDesignInputs(state);
  const totalServerPorts = servers * gpu.ibPortsPerServer;
  const leafPortCount = ibSpeed >= 800 ? 64 : 64;
  const spinePortCount = ibSpeed >= 800 ? 64 : 64;
  const leafDownPorts = servers <= 8 ? leafPortCount : Math.floor(leafPortCount / 2);
  const leafCount = Math.max(1, Math.ceil(totalServerPorts / leafDownPorts));
  const usedDownPorts = Math.ceil(totalServerPorts / leafCount);
  const upPortsPerLeaf = servers <= 8 ? 0 : Math.max(2, Math.ceil(usedDownPorts / ratio));
  const totalUplinks = leafCount * upPortsPerLeaf;
  const spineCount = totalUplinks > 0 ? Math.max(2, Math.ceil(totalUplinks / spinePortCount)) : 0;
  const ibCableCount = totalServerPorts + totalUplinks;
  const managementPorts = servers + state.managementNodes;
  const managementSwitches = Math.max(1, Math.ceil(managementPorts / MANAGEMENT_PORTS_PER_SWITCH));
  const topologyType =
    servers <= 8 ? "单层 IB Leaf" : servers <= 64 ? "两层 Leaf-Spine" : "Clos / Fat-tree";

  const leafPrice = state.leafSwitchPrice;
  const spinePrice = state.spineSwitchPrice;
  const cablePrice = state.ibCableUnitPrice;
  const managementSwitchPrice = state.managementSwitchPrice;

  const bom = [
    {
      category: "计算",
      item: `${gpu.name} 8GPU 服务器模组`,
      spec: "8GPU/台，含主机、GPU、基础 NVLink/NVSwitch 模组",
      quantity: `${servers} 台`,
      logic: state.clusterSizingMode === "auto" ? "按业务场景约束推荐" : "手动输入服务器规模",
      note: "含服务器整机模组",
      amount: servers * state.serverUnitPrice,
    },
    {
      category: "训练网络",
      item: "IB Leaf 交换机",
      spec: `${ibSpeed}G InfiniBand，按逻辑 Leaf 层估算`,
      quantity: `${leafCount} 台`,
      logic: `数量按服务器侧 IB 接入口估算，单价 ${moneyWan(leafPrice)}/台`,
      note: `${topologyType} 接入层，可按市场报价修正`,
      amount: leafCount * leafPrice,
    },
    {
      category: "训练网络",
      item: "IB Spine 交换机",
      spec: `${ibSpeed}G InfiniBand，按逻辑 Spine 层估算`,
      quantity: `${spineCount} 台`,
      logic: spineCount > 0 ? `按 ${ratio}:1 收敛比估算 Leaf 上联，单价 ${moneyWan(spinePrice)}/台` : "单层 Leaf 方案无需 Spine",
      note: spineCount > 0 ? "用于跨 Leaf 东西向通信，可按市场报价修正" : "小规模集群保留该行便于复核",
      amount: spineCount * spinePrice,
    },
    {
      category: "训练网络",
      item: "IB 线缆/光模块或 DAC/AOC",
      spec: `${ibSpeed}G 链路配套介质`,
      quantity: `${ibCableCount} 条/套`,
      logic: `服务器至 Leaf 链路 + Leaf 至 Spine 链路，单价 ${moneyWan(cablePrice)}/条`,
      note: "单独评估光模块、DAC/AOC 与线缆成本",
      amount: ibCableCount * cablePrice,
    },
    {
      category: "管理网络",
      item: "管理面交换机",
      spec: "48 口以太网管理交换机",
      quantity: `${managementSwitches} 台`,
      logic: `按管理口容量估算，单价 ${moneyWan(managementSwitchPrice)}/台`,
      note: "独立管理面",
      amount: managementSwitches * managementSwitchPrice,
    },
  ];

  const networkCost = bom
    .filter((row) => row.category.includes("网络"))
    .reduce((sum, row) => sum + row.amount, 0);

  return {
    gpu,
    recommendedServers,
    servers,
    ibSpeed,
    ratio,
    totalCards: servers * GPUS_PER_SERVER,
    denseFp16Tflops: servers * GPUS_PER_SERVER * gpu.denseFp16Tflops,
    leafCount,
    spineCount,
    ibCableCount,
    managementSwitches,
    topologyType,
    networkCost,
    bom,
  };
}

function oneTimePolicy(amount, redeemRate, redeemYear, years) {
  const nominal = amount;
  const isInPeriod = redeemYear >= 1 && redeemYear <= years;
  const adjusted = isInPeriod ? nominal * redeemRate : 0;
  return {
    nominal,
    adjusted,
    gap: isInPeriod ? nominal - adjusted : nominal,
  };
}

function annualPolicy(amount, redeemRate, startYear, years) {
  const activeYears = startYear >= 1 && startYear <= years ? years - startYear + 1 : 0;
  const nominal = amount * activeYears;
  const adjusted = nominal * redeemRate;
  return {
    annualNominal: amount,
    activeYears,
    nominal,
    adjusted,
    gap: nominal - adjusted,
    averageAnnualAdjusted: years > 0 ? adjusted / years : 0,
  };
}

function calculatePolicyCashflow(state) {
  const construction = oneTimePolicy(
    state.constructionSubsidy,
    state.constructionSubsidyRate,
    state.constructionSubsidyYear,
    state.years,
  );
  const equipment = oneTimePolicy(
    state.equipmentSubsidy,
    state.equipmentSubsidyRate,
    state.equipmentSubsidyYear,
    state.years,
  );
  const voucher =
    state.revenueMode === "saving"
      ? annualPolicy(state.annualVoucher, state.voucherRedeemRate, state.voucherStartYear, state.years)
      : annualPolicy(0, state.voucherRedeemRate, state.voucherStartYear, state.years);
  const rack = annualPolicy(state.rackSubsidy, state.rackSubsidyRate, state.rackSubsidyStartYear, state.years);
  const loan = annualPolicy(
    state.loanInterestSubsidy,
    state.loanInterestSubsidyRate,
    state.loanInterestSubsidyStartYear,
    state.years,
  );
  const tax = annualPolicy(state.taxIncentive, state.taxIncentiveRate, state.taxIncentiveStartYear, state.years);

  const oneTimePolicies = [construction, equipment];
  const annualPolicies = [voucher, rack, loan, tax];
  const oneTimeAdjusted = oneTimePolicies.reduce((sum, policy) => sum + policy.adjusted, 0);
  const annualAdjusted = annualPolicies.reduce((sum, policy) => sum + policy.adjusted, 0);
  const nominal = [...oneTimePolicies, ...annualPolicies].reduce((sum, policy) => sum + policy.nominal, 0);
  const adjusted = oneTimeAdjusted + annualAdjusted;

  return {
    construction,
    equipment,
    voucher,
    rack,
    loan,
    tax,
    oneTimeAdjusted,
    annualAdjusted,
    averageAnnualAdjusted: state.years > 0 ? annualAdjusted / state.years : 0,
    nominal,
    adjusted,
    gap: Math.max(0, nominal - adjusted),
  };
}

function calculate(state) {
  const fabric = calculateFabric(state);
  const computeCost = fabric.bom[0].amount;
  const managementCost = state.managementNodes * 18;
  const includeStorage = state.storageScope === "included";
  const optionalHotStorageCost = state.hotStorageTb * state.hotStoragePrice;
  const optionalColdStorageCost = state.coldStorageTb * state.coldStoragePrice;
  const optionalStorageCost = optionalHotStorageCost + optionalColdStorageCost;
  const hotStorageCost = includeStorage ? optionalHotStorageCost : 0;
  const coldStorageCost = includeStorage ? optionalColdStorageCost : 0;
  const directHardware = computeCost + managementCost + hotStorageCost + coldStorageCost + fabric.networkCost;
  const integrationCost = directHardware * state.integrationRate;
  const spareCost = directHardware * state.spareRate;
  const taxableCapex = directHardware + state.softwareCost + integrationCost + spareCost;
  const capex = taxableCapex;

  const itPowerKw = fabric.servers * state.kwPerServer + state.managementNodes * 0.8;
  const annualPowerCost = (itPowerKw * state.pue * 24 * 365 * state.powerPrice * state.loadRate) / 10000;
  const calculatedRackCount = Math.max(1, Math.ceil(itPowerKw / Math.max(1, state.rackPowerKw)));
  const annualRackCost =
    state.rackBillingMode === "power"
      ? (itPowerKw * state.rackPackagePrice * 12) / 10000
      : calculatedRackCount * state.rackRent * 12;
  const annualOpex = annualPowerCost + annualRackCost + state.networkOpex + state.opsCost + state.otherOpex;
  const totalOpex = annualOpex * state.years;
  const serviceCost = state.softwareCost + integrationCost + spareCost;
  const policy = calculatePolicyCashflow(state);
  const netInvestment = Math.max(0, capex - policy.oneTimeAdjusted);
  const tco = netInvestment + totalOpex;

  const annualRentalIncome = fabric.servers * state.deviceMonthlyRent * 12 * state.deviceLeaseRate;
  const annualVoucherIncome = state.revenueMode === "saving" ? policy.voucher.averageAnnualAdjusted : 0;
  const cumulativeRentalIncome = annualRentalIncome * state.years;
  const cumulativeVoucherIncome = state.revenueMode === "saving" ? policy.voucher.adjusted : 0;
  const cumulativeVoucherDiscount = state.revenueMode === "saving" ? policy.voucher.nominal : 0;
  const cumulativeIncome = cumulativeRentalIncome + policy.annualAdjusted;

  const annualAverageIncome = annualRentalIncome + policy.averageAnnualAdjusted;
  const annualNetCash = annualAverageIncome - annualOpex;
  const payback = annualNetCash > 0 ? netInvestment / annualNetCash : Infinity;
  const netProfit = cumulativeIncome - tco;
  const roi = tco > 0 ? netProfit / tco : 0;
  const effectiveTco = Math.max(0, tco - policy.annualAdjusted);
  const annualCardCost = fabric.totalCards > 0 ? effectiveTco / state.years / fabric.totalCards : 0;
  const cardHourCost =
    fabric.totalCards > 0 && state.deviceLeaseRate > 0
      ? (effectiveTco * 10000) / (fabric.totalCards * 24 * 365 * state.years * state.deviceLeaseRate)
      : 0;

  const bom = [
    ...fabric.bom,
    {
      category: "软件",
      item: "AI 平台、监控、安全与基础授权",
      spec: "阶段估算费用",
      quantity: "1 批",
      logic: "按软件平台费用输入",
      note: "后续可拆到软件模块",
      amount: state.softwareCost,
    },
    {
      category: "服务",
      item: "集成实施服务",
      spec: `${(state.integrationRate * 100).toFixed(1)}%`,
      quantity: "1 项",
      logic: "按直接硬件投资比例估算",
      note: "含方案深化、到货验收、联调",
      amount: integrationCost,
    },
    {
      category: "服务",
      item: "备品备件",
      spec: `${(state.spareRate * 100).toFixed(1)}%`,
      quantity: "1 批",
      logic: "按直接硬件投资比例估算",
      note: "估算级口径",
      amount: spareCost,
    },
  ];

  return {
    ...fabric,
    computeCost,
    managementCost,
    directHardware,
    includeStorage,
    optionalStorageCost,
    hotStorageCost,
    coldStorageCost,
    integrationCost,
    spareCost,
    serviceCost,
    capex,
    netInvestment,
    itPowerKw,
    calculatedRackCount,
    annualPowerCost,
    annualRackCost,
    annualOpex,
    totalOpex,
    tco,
    effectiveTco,
    annualRentalIncome,
    annualVoucherIncome,
    cumulativeRentalIncome,
    cumulativeVoucherIncome,
    cumulativeVoucherDiscount,
    cumulativeIncome,
    annualAverageIncome,
    annualNetCash,
    payback,
    netProfit,
    roi,
    policy,
    annualCardCost,
    cardHourCost,
    bom,
  };
}

function updateTopology(state, result) {
  document.getElementById("topologyServers").textContent = `${result.servers} 台 8GPU 模组`;
  document.getElementById("topologyGpuSummary").textContent =
    `${result.gpu.name.replace("NVIDIA ", "")} / ${result.totalCards} 张 GPU`;
  document.getElementById("topologyIbSpeed").textContent = `${result.ibSpeed}G IB`;
  document.getElementById("topologyFabric").textContent = `${result.topologyType} / ${result.ratio}:1`;
  document.getElementById("topologySwitchSummary").textContent =
    result.spineCount > 0
      ? `Leaf ${result.leafCount} 台 + Spine ${result.spineCount} 台`
      : `Leaf ${result.leafCount} 台，单层组网`;
  document.getElementById("managementSwitches").textContent = `${result.managementSwitches} 台`;
  document.getElementById("managementPortsSummary").textContent =
    `约 ${result.servers} 个管理口，48 口交换机估算`;
  document.getElementById("networkSummary").textContent = `${result.topologyType} / ${result.ibSpeed}G IB / ${result.ratio}:1 收敛`;
  document.getElementById("managementSummary").textContent = `独立管理面，约 ${result.managementSwitches} 台 48 口管理交换机`;

  const sizingText =
    state.clusterSizingMode === "auto"
      ? `系统按 ${textMaps.workload[state.workload]}、${getActiveSizingText(state)} 推荐 ${result.recommendedServers} 台服务器。`
      : `当前采用手动规模 ${result.servers} 台服务器。`;
  document.getElementById("designGuidance").textContent = `${sizingText} ${result.gpu.fabricHint} 管理面按独立以太网估算，不纳入 IB Fabric。`;
}

function getActiveSizingText(state) {
  if (state.workload === "training") {
    return `模型规模 ${textMaps.modelScale[state.modelScale]}`;
  }
  if (state.workload === "inference") {
    return `推理服务规模 ${textMaps.inferenceScale[state.inferenceScale]}`;
  }
  return `模型规模 ${textMaps.modelScale[state.modelScale]} 与推理服务规模 ${textMaps.inferenceScale[state.inferenceScale]}`;
}

function updateBom(bom) {
  const rows = bom
    .map(
      (row) => `
        <tr>
          <td>${row.category}</td>
          <td>${row.item}</td>
          <td>${row.spec}</td>
          <td>${row.quantity}</td>
          <td>${row.logic}</td>
          <td>${row.note}</td>
          <td>${moneyWan(row.amount)}</td>
        </tr>
      `,
    )
    .join("");
  document.getElementById("bomBody").innerHTML = rows;
}

function updateReport(state, result) {
  const paybackText =
    Number.isFinite(result.payback) && result.payback <= state.years
      ? `${result.payback.toFixed(1)} 年`
      : "测算周期内未完全回收";
  const rackBillingText =
    state.rackBillingMode === "power"
      ? `${state.rackPackagePrice.toLocaleString("zh-CN")} 元/kW/月打包计费`
      : `${result.calculatedRackCount} 个机柜 * ${moneyWan(state.rackRent)}/月`;
  const storageNote = result.includeStorage ? "已纳入 CAPEX" : "可选项，未纳入默认 CAPEX";
  const capexRows = [
    ["GPU 服务器", moneyWan(result.computeCost), `${result.servers} 台 8GPU ${result.gpu.name} 模组`],
    ["IB/管理网络", moneyWan(result.networkCost + result.managementCost), `IB 交换机、光模块/线缆与管理面交换机`],
    ["存储投资", moneyWan(result.hotStorageCost + result.coldStorageCost), storageNote],
    ["软件平台", moneyWan(state.softwareCost), "AI 平台、监控、安全与基础授权"],
    ["集成实施", moneyWan(result.integrationCost), `${(state.integrationRate * 100).toFixed(1)}% 直接硬件投资`],
    ["备品备件", moneyWan(result.spareCost), `${(state.spareRate * 100).toFixed(1)}% 直接硬件投资`],
    ["CAPEX 合计", moneyWan(result.capex), "默认按设备采购含税口径"],
    ["一次性政策后净投资", moneyWan(result.netInvestment), "CAPEX - 一次性已兑现补贴"],
  ];
  const opexRows = [
    ["电费", moneyWan(result.annualPowerCost), `${result.itPowerKw.toFixed(1)} kW IT 功率，PUE ${state.pue}`],
    ["机柜/场地", moneyWan(result.annualRackCost), rackBillingText],
    ["专线/带宽", moneyWan(state.networkOpex), "年度网络运营成本"],
    ["运维人员与服务", moneyWan(state.opsCost), "年度运维服务成本"],
    ["保险及其他", moneyWan(state.otherOpex), "年度其他运营成本"],
    ["年度 OPEX 合计", moneyWan(result.annualOpex), "年度运营成本小计"],
    [`${state.years} 年 OPEX 合计`, moneyWan(result.totalOpex), "年度 OPEX * 测算周期"],
  ];
  const policyRows = [
    ["一次性政策名义金额", moneyWan(result.policy.construction.nominal + result.policy.equipment.nominal), "建设补贴 + 设备购置补贴"],
    ["一次性已兑现补贴", moneyWan(result.policy.oneTimeAdjusted), "只抵减净投资，不重复计入年度收入"],
    ["年度政策名义金额", moneyWan(result.policy.voucher.nominal + result.policy.rack.nominal + result.policy.loan.nominal + result.policy.tax.nominal), "算力券、场地补贴、贴息、税收优惠"],
    ["年度政策兑现收益", moneyWan(result.policy.annualAdjusted), "按兑现比例和生效年度折算"],
    ["算力券客户抵扣额", moneyWan(result.cumulativeVoucherDiscount), "客户侧抵扣成交金额"],
    ["算力券平台兑现额", moneyWan(result.cumulativeVoucherIncome), "平台侧按兑现比例形成政策回款"],
    ["政策兑现缺口", moneyWan(result.policy.gap), "名义金额 - 风险调整后兑现收益"],
  ];
  const returnRows = [
    ["裸设备租赁收入", moneyWan(result.cumulativeRentalIncome), `${moneyWan(state.deviceMonthlyRent)}/设备/月，出租率 ${(state.deviceLeaseRate * 100).toFixed(1)}%`],
    ["风险调整后总收入", moneyWan(result.cumulativeIncome), "租赁收入 + 年度政策现金流"],
    [`${state.years} 年 TCO`, moneyWan(result.tco), "政策后净投资 + 周期 OPEX"],
    ["风险调整后净收益", moneyWan(result.netProfit), "总收入 - TCO"],
    ["ROI", percent(result.roi * 100), "周期净收益 / 周期总投入"],
    ["投资回收期", paybackText, "政策后净投资 / 年度经营现金流"],
    ["单卡年化成本", moneyWan(result.annualCardCost), `${result.totalCards} 张 GPU 摊销口径`],
    ["单卡小时成本", moneyYuan(result.cardHourCost), "按实际出租率折算"],
  ];
  const roiStatus =
    result.annualNetCash <= 0
      ? "年度经营现金流为负，当前方案在测算周期内不具备自然回收能力。"
      : result.payback <= state.years
        ? `按当前出租率与政策兑现假设，预计约 ${result.payback.toFixed(1)} 年回收，周期内具备完整回收条件。`
        : `按当前出租率与政策兑现假设，回收期约 ${result.payback.toFixed(1)} 年，长于 ${state.years} 年测算周期。`;
  const roiAdvice =
    result.roi >= 0.15
      ? "ROI 表现较积极，建议重点复核市场租赁需求、上架率稳定性与 GPU 设备报价锁定。"
      : result.roi >= 0
        ? "ROI 处于可讨论区间，建议优先优化设备采购价、出租率、机柜/电力成本和政策兑现确定性。"
        : "ROI 为负，建议重新校正 CAPEX 单价、租赁价格、出租率和政策兑现比例后再进入投资决策。";
  const policyAdvice =
    result.policy.gap > 0
      ? `政策名义金额与风险调整后收益存在 ${moneyWan(result.policy.gap)} 兑现缺口，建议把未兑现部分作为敏感性风险处理。`
      : "政策假设下暂无兑现缺口，但仍建议在合同或批复文件中明确兑现年度与兑现条件。";
  const cashflowAdvice =
    result.annualNetCash > 0
      ? `年度经营现金流约 ${moneyWan(result.annualNetCash)}，主要由租赁收入和年度政策现金流覆盖年度 OPEX。`
      : `年度经营现金流约 ${moneyWan(result.annualNetCash)}，租赁收入和年度政策现金流尚不足以覆盖年度 OPEX。`;
  const renderRows = (rows) =>
    rows
      .map(
        ([item, amount, note]) => `
          <tr>
            <td>${item}</td>
            <td>${amount}</td>
            <td>${note}</td>
          </tr>
        `,
      )
      .join("");

  document.getElementById("reportPreview").innerHTML = `
    <div class="summary-strip">
      <article>
        <span>项目方案</span>
        <strong>${state.projectName}</strong>
        <p>${state.location} / ${textMaps.computeRoute[state.computeRoute]} / ${textMaps.workload[state.workload]}</p>
      </article>
      <article>
        <span>建设规模</span>
        <strong>${result.servers} 台 / ${result.totalCards} 张 GPU</strong>
        <p>${result.gpu.name}，${formatPf16(result.denseFp16Tflops)}</p>
      </article>
      <article>
        <span>组网方案</span>
        <strong>${result.topologyType}</strong>
        <p>${result.ibSpeed}G IB，目标收敛比 ${result.ratio}:1</p>
      </article>
      <article>
        <span>商务模式</span>
        <strong>${textMaps.revenueMode[state.revenueMode]}</strong>
        <p>测算周期 ${state.years} 年</p>
      </article>
    </div>
    <section class="summary-block">
      <h4>CAPEX 投资小计</h4>
      <div class="summary-table-wrap">
        <table class="summary-table">
          <thead>
            <tr><th>投资项</th><th>金额</th><th>测算口径</th></tr>
          </thead>
          <tbody>${renderRows(capexRows)}</tbody>
        </table>
      </div>
    </section>
    <section class="summary-block">
      <h4>OPEX 年度运营小计</h4>
      <div class="summary-table-wrap">
        <table class="summary-table">
          <thead>
            <tr><th>运营项</th><th>金额</th><th>测算口径</th></tr>
          </thead>
          <tbody>${renderRows(opexRows)}</tbody>
        </table>
      </div>
    </section>
    <section class="summary-block">
      <h4>政策抵扣与兑现</h4>
      <div class="summary-table-wrap">
        <table class="summary-table">
          <thead>
            <tr><th>政策项</th><th>金额</th><th>现金流口径</th></tr>
          </thead>
          <tbody>${renderRows(policyRows)}</tbody>
        </table>
      </div>
    </section>
    <section class="summary-block">
      <h4>投资回报测算</h4>
      <div class="summary-table-wrap">
        <table class="summary-table">
          <thead>
            <tr><th>回报项</th><th>结果</th><th>计算口径</th></tr>
          </thead>
          <tbody>${renderRows(returnRows)}</tbody>
        </table>
      </div>
    </section>
    <section class="summary-analysis">
      <h4>ROI 分析意见</h4>
      <p>${roiStatus}</p>
      <p>${cashflowAdvice}</p>
      <p>${roiAdvice}</p>
      <p>${policyAdvice}</p>
    </section>
  `;
}

function syncGpuDefaults() {
  const gpu = gpuCatalog[textValue("gpuModel")];
  document.getElementById("serverUnitPrice").value = gpu.serverPriceWan;
  document.getElementById("kwPerServer").value = gpu.kwPerServer;
}

function updateInputAvailability(state) {
  const serverInput = document.getElementById("serverCount");
  serverInput.disabled = state.clusterSizingMode === "auto";
  serverInput.title = state.clusterSizingMode === "auto" ? "自动推荐模式下由业务约束决定" : "手动输入服务器数量";

  const modelScale = document.getElementById("modelScale");
  const inferenceScale = document.getElementById("inferenceScale");
  const modelScaleField = document.getElementById("modelScaleField");
  const inferenceScaleField = document.getElementById("inferenceScaleField");
  const modelScaleHint = document.getElementById("modelScaleHint");
  const inferenceScaleHint = document.getElementById("inferenceScaleHint");
  const modelDisabled = state.workload === "inference";
  const inferenceDisabled = state.workload === "training";

  modelScale.disabled = modelDisabled;
  inferenceScale.disabled = inferenceDisabled;
  modelScaleField.classList.toggle("is-muted", modelDisabled);
  inferenceScaleField.classList.toggle("is-muted", inferenceDisabled);
  modelScale.title = modelDisabled ? "推理优先时不参与自动推荐数量计算" : "用于训练或混合负载的规模推荐";
  inferenceScale.title = inferenceDisabled ? "训练优先时不参与自动推荐数量计算" : "用于推理或混合负载的规模推荐";
  modelScaleHint.textContent = modelDisabled ? "推理优先时不参与服务器数量推荐" : "参与训练/混合负载推荐";
  inferenceScaleHint.textContent = inferenceDisabled ? "训练优先时不参与服务器数量推荐" : "参与推理/混合负载推荐";

  ["annualVoucher", "voucherRedeemRate", "voucherStartYear"].forEach((id) => {
    const input = document.getElementById(id);
    input.disabled = state.revenueMode !== "saving";
    input.title = state.revenueMode === "saving" ? "租赁 + 算力券协同模式下参与现金流" : "裸设备租赁模式下不参与现金流";
  });

  const rackCountInput = document.getElementById("rackCount");
  rackCountInput.disabled = true;
  rackCountInput.title = "按 IT 功耗与单机柜功耗自动估算";

  const rackRentInput = document.getElementById("rackRent");
  const rackPackageInput = document.getElementById("rackPackagePrice");
  rackRentInput.disabled = state.rackBillingMode === "power";
  rackPackageInput.disabled = state.rackBillingMode !== "power";
  rackRentInput.title = state.rackBillingMode === "power" ? "按功率打包价模式下不参与计算" : "按机柜月租模式下参与计算";
  rackPackageInput.title = state.rackBillingMode === "power" ? "按 IT 功率计费，单位为元/kW/月" : "按机柜月租模式下不参与计算";
}

function render() {
  const state = buildState();
  const result = calculate(state);

  if (state.clusterSizingMode === "auto" && numberValue("serverCount") !== result.servers) {
    document.getElementById("serverCount").value = result.servers;
  }

  if (numberValue("rackCount") !== result.calculatedRackCount) {
    document.getElementById("rackCount").value = result.calculatedRackCount;
  }

  updateInputAvailability(state);

  document.getElementById("nodeSpecMetric").textContent =
    `${result.gpu.name.replace("NVIDIA ", "")} ${result.servers} 台套`;
  document.getElementById("fp16Metric").textContent = formatPf16(result.denseFp16Tflops);
  document.getElementById("clusterMetric").textContent = `${result.servers} 台`;
  document.getElementById("topologyMetric").textContent = result.topologyType;
  document.getElementById("hardwareCapexMetric").textContent = moneyWan(result.directHardware);
  document.getElementById("serviceCostMetric").textContent = moneyWan(result.serviceCost);
  document.getElementById("annualOpexMetric").textContent = moneyWan(result.annualOpex);
  document.getElementById("netInvestmentMetric").textContent = moneyWan(result.netInvestment);
  document.getElementById("rentalIncomeMetric").textContent = moneyWan(result.cumulativeRentalIncome);
  document.getElementById("voucherIncomeMetric").textContent = moneyWan(result.cumulativeVoucherDiscount);
  document.getElementById("voucherRedeemedMetric").textContent = moneyWan(result.cumulativeVoucherIncome);
  document.getElementById("policyNominalMetric").textContent = moneyWan(result.policy.nominal);
  document.getElementById("policyAdjustedMetric").textContent = moneyWan(result.policy.adjusted);
  document.getElementById("policyGapMetric").textContent = moneyWan(result.policy.gap);
  document.getElementById("tcoMetric").textContent = moneyWan(result.tco);
  document.getElementById("paybackMetric").textContent = Number.isFinite(result.payback)
    ? `${result.payback.toFixed(1)} 年`
    : "未回收";
  document.getElementById("annualCardCost").textContent = moneyWan(result.annualCardCost);
  document.getElementById("cardHourCost").textContent = moneyYuan(result.cardHourCost);
  document.getElementById("netProfit").textContent = moneyWan(result.netProfit);
  document.getElementById("roiMetric").textContent = percent(result.roi * 100);

  updateTopology(state, result);
  updateBom(result.bom);
  updateReport(state, result);
}

function resetDefaults() {
  inputIds.forEach((id) => {
    const input = document.getElementById(id);
    input.value = defaults[id];
  });
  render();
}

function init() {
  inputIds.forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", render);
    input.addEventListener("change", render);
  });

  document.getElementById("gpuModel").addEventListener("change", () => {
    syncGpuDefaults();
    render();
  });

  document.getElementById("resetBtn").addEventListener("click", resetDefaults);
  document.getElementById("printBtn").addEventListener("click", () => window.print());

  document.querySelectorAll(".nav-list a").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".nav-list a").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    });
  });

  render();
}

init();
