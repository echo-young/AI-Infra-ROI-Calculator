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
  expansionPlan: "standard",
  costSensitivity: "balanced",
  managementNodes: 3,
  hotStorageTb: 800,
  coldStorageTb: 1600,
  hotStoragePrice: 0.65,
  coldStoragePrice: 0.18,
  softwareCost: 180,
  integrationRate: 5,
  spareRate: 2,
  taxRate: 13,
  rackCount: 12,
  rackRent: 1.8,
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
  powerDiscount: 0,
  powerDiscountRate: 80,
  powerDiscountStartYear: 1,
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
    expansionPlan: textValue("expansionPlan"),
    costSensitivity: textValue("costSensitivity"),
    managementNodes: numberValue("managementNodes"),
    hotStorageTb: numberValue("hotStorageTb"),
    coldStorageTb: numberValue("coldStorageTb"),
    hotStoragePrice: numberValue("hotStoragePrice"),
    coldStoragePrice: numberValue("coldStoragePrice"),
    softwareCost: numberValue("softwareCost"),
    integrationRate: numberValue("integrationRate") / 100,
    spareRate: numberValue("spareRate") / 100,
    taxRate: numberValue("taxRate") / 100,
    rackCount: numberValue("rackCount"),
    rackRent: numberValue("rackRent"),
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
    powerDiscount: numberValue("powerDiscount"),
    powerDiscountRate: numberValue("powerDiscountRate") / 100,
    powerDiscountStartYear: numberValue("powerDiscountStartYear"),
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

  const leafPrice = ibSpeed >= 800 ? 120 : 70;
  const spinePrice = ibSpeed >= 800 ? 140 : 80;
  const cablePrice = ibSpeed >= 800 ? 1.6 : 0.9;
  const managementSwitchPrice = 3.5;

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
      logic: "按服务器侧 IB 接入端口与 Leaf 下行端口容量估算",
      note: `${topologyType} 接入层`,
      amount: leafCount * leafPrice,
    },
    {
      category: "训练网络",
      item: "IB Spine 交换机",
      spec: `${ibSpeed}G InfiniBand，按逻辑 Spine 层估算`,
      quantity: `${spineCount} 台`,
      logic: spineCount > 0 ? `按 ${ratio}:1 收敛比估算 Leaf 上联` : "单层 Leaf 方案无需 Spine",
      note: spineCount > 0 ? "用于跨 Leaf 东西向通信" : "小规模集群保留该行便于复核",
      amount: spineCount * spinePrice,
    },
    {
      category: "训练网络",
      item: "IB 线缆/光模块或 DAC/AOC",
      spec: `${ibSpeed}G 链路配套介质`,
      quantity: `${ibCableCount} 条/套`,
      logic: "服务器至 Leaf 链路 + Leaf 至 Spine 链路估算",
      note: "按链路介质估算",
      amount: ibCableCount * cablePrice,
    },
    {
      category: "管理网络",
      item: "管理面交换机",
      spec: "48 口以太网管理交换机",
      quantity: `${managementSwitches} 台`,
      logic: "按 GPU 服务器管理口与管理节点端口容量估算",
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
  const power = annualPolicy(state.powerDiscount, state.powerDiscountRate, state.powerDiscountStartYear, state.years);
  const rack = annualPolicy(state.rackSubsidy, state.rackSubsidyRate, state.rackSubsidyStartYear, state.years);
  const loan = annualPolicy(
    state.loanInterestSubsidy,
    state.loanInterestSubsidyRate,
    state.loanInterestSubsidyStartYear,
    state.years,
  );
  const tax = annualPolicy(state.taxIncentive, state.taxIncentiveRate, state.taxIncentiveStartYear, state.years);

  const oneTimePolicies = [construction, equipment];
  const annualPolicies = [voucher, power, rack, loan, tax];
  const oneTimeAdjusted = oneTimePolicies.reduce((sum, policy) => sum + policy.adjusted, 0);
  const annualAdjusted = annualPolicies.reduce((sum, policy) => sum + policy.adjusted, 0);
  const nominal = [...oneTimePolicies, ...annualPolicies].reduce((sum, policy) => sum + policy.nominal, 0);
  const adjusted = oneTimeAdjusted + annualAdjusted;

  return {
    construction,
    equipment,
    voucher,
    power,
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
  const hotStorageCost = state.hotStorageTb * state.hotStoragePrice;
  const coldStorageCost = state.coldStorageTb * state.coldStoragePrice;
  const directHardware = computeCost + managementCost + hotStorageCost + coldStorageCost + fabric.networkCost;
  const integrationCost = directHardware * state.integrationRate;
  const spareCost = directHardware * state.spareRate;
  const taxableCapex = directHardware + state.softwareCost + integrationCost + spareCost;
  const taxCost = taxableCapex * state.taxRate;
  const capex = taxableCapex + taxCost;

  const itPowerKw = fabric.servers * state.kwPerServer + state.managementNodes * 0.8;
  const annualPowerCost = (itPowerKw * state.pue * 24 * 365 * state.powerPrice * state.loadRate) / 10000;
  const annualRackCost = state.rackCount * state.rackRent * 12;
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
    {
      category: "税费",
      item: "增值税估算",
      spec: `${(state.taxRate * 100).toFixed(1)}%`,
      quantity: "1 项",
      logic: "按投资额税率估算",
      note: "正式测算需按采购合同修正",
      amount: taxCost,
    },
  ];

  return {
    ...fabric,
    computeCost,
    directHardware,
    serviceCost,
    capex,
    netInvestment,
    itPowerKw,
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

  document.getElementById("reportPreview").innerHTML = `
    <article>
      <h4>1. 方案规划</h4>
      <p>${state.projectName} 位于 ${state.location}，采用 ${textMaps.computeRoute[state.computeRoute]} 路线，按 ${textMaps.workload[state.workload]} 场景规划 ${result.servers} 台 ${result.gpu.name} 8GPU 服务器模组，形成 ${result.topologyType}，训练网络采用 ${result.ibSpeed}G InfiniBand，目标收敛比 ${result.ratio}:1。</p>
    </article>
    <article>
      <h4>2. 投资估算</h4>
      <p>硬件 BOM 投资约 ${moneyWan(result.directHardware)}，软件/服务成本约 ${moneyWan(result.serviceCost)}，含税初始 CAPEX 约 ${moneyWan(result.capex)}；年度 OPEX 约 ${moneyWan(result.annualOpex)}，主要由机柜、电力、负载、带宽、运维和保险构成。</p>
    </article>
    <article>
      <h4>3. 政策与商务变量</h4>
      <p>商务模式为${textMaps.revenueMode[state.revenueMode]}，裸设备租赁按每设备/月 ${moneyWan(state.deviceMonthlyRent)}、出租率/上架率 ${(state.deviceLeaseRate * 100).toFixed(1)}% 测算；政策名义金额约 ${moneyWan(result.policy.nominal)}，按兑现比例与兑现年度折算后约 ${moneyWan(result.policy.adjusted)}，兑现缺口约 ${moneyWan(result.policy.gap)}。</p>
    </article>
    <article>
      <h4>4. 投资收益评估</h4>
      <p>一次性政策兑现后净投资约 ${moneyWan(result.netInvestment)}，${state.years} 年 TCO 约 ${moneyWan(result.tco)}，累计裸设备租赁收入约 ${moneyWan(result.cumulativeRentalIncome)}；算力券客户抵扣约 ${moneyWan(result.cumulativeVoucherDiscount)}，平台兑现约 ${moneyWan(result.cumulativeVoucherIncome)}。风险调整后净收益约 ${moneyWan(result.netProfit)}，ROI 为 ${percent(result.roi * 100)}，投资回收期为 ${paybackText}。</p>
    </article>
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
}

function render() {
  const state = buildState();
  const result = calculate(state);

  if (state.clusterSizingMode === "auto" && numberValue("serverCount") !== result.servers) {
    document.getElementById("serverCount").value = result.servers;
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
