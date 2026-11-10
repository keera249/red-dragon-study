/**
 * Curated reference dataset of Chinese universities used to auto-fill the Admin
 * "Add University" form (city, province, Chinese/Arabic names) and to display
 * the QS World University Ranking on public university pages.
 *
 * QS ACCURACY POLICY
 * ------------------
 * - `qs.verified === true`  → rank was cross-checked against multiple independent
 *   publications of the official QS World University Rankings table. It is shown
 *   publicly automatically.
 * - `qs.verified === false` → rank was found in a single source only (or sources
 *   disagreed). It is ONLY suggested to the Admin inside the dashboard and is NOT
 *   shown publicly until the Admin confirms/saves it in the QS field.
 * - Universities without a `qs` entry never get a fabricated rank.
 *
 * When QS publishes a new edition, update `QS_EDITION_YEAR` and the ranks below.
 */

export const QS_EDITION_YEAR = 2027;
export const QS_SOURCE_URL = 'https://www.topuniversities.com/world-university-rankings';

export interface KnownUniversity {
  nameEn: string;
  aliases?: string[];
  nameZh: string;
  nameAr: string;
  city: string;
  cityAr: string;
  province: string;
  provinceAr: string;
  universityType?: string;
  qs?: { rank: string; year: number; verified: boolean };
}

const DFC = 'جامعة بحثية حكومية (Double First-Class)';
const PUB = 'جامعة حكومية';

const v = (rank: string) => ({ rank, year: QS_EDITION_YEAR, verified: true });
const u = (rank: string) => ({ rank, year: QS_EDITION_YEAR, verified: false });

export const KNOWN_CHINESE_UNIVERSITIES: KnownUniversity[] = [
  // ── QS ranked (cross-verified) ──────────────────────────────────────────
  { nameEn: 'Peking University', aliases: ['PKU', 'Beijing University'], nameZh: '北京大学', nameAr: 'جامعة بكين', city: 'Beijing', cityAr: 'بكين', province: 'Beijing', provinceAr: 'بكين', universityType: DFC, qs: v('13') },
  { nameEn: 'Tsinghua University', aliases: ['THU'], nameZh: '清华大学', nameAr: 'جامعة تسينغهوا', city: 'Beijing', cityAr: 'بكين', province: 'Beijing', provinceAr: 'بكين', universityType: DFC, qs: v('14') },
  { nameEn: 'Fudan University', nameZh: '复旦大学', nameAr: 'جامعة فودان', city: 'Shanghai', cityAr: 'شانغهاي', province: 'Shanghai', provinceAr: 'شانغهاي', universityType: DFC, qs: v('26') },
  { nameEn: 'Shanghai Jiao Tong University', aliases: ['SJTU', 'Shanghai Jiaotong University'], nameZh: '上海交通大学', nameAr: 'جامعة شانغهاي جياو تونغ', city: 'Shanghai', cityAr: 'شانغهاي', province: 'Shanghai', provinceAr: 'شانغهاي', universityType: DFC, qs: v('36') },
  { nameEn: 'Zhejiang University', aliases: ['ZJU'], nameZh: '浙江大学', nameAr: 'جامعة تشجيانغ', city: 'Hangzhou', cityAr: 'هانغتشو', province: 'Zhejiang', provinceAr: 'تشجيانغ', universityType: DFC, qs: v('47') },
  { nameEn: 'Nanjing University', aliases: ['NJU'], nameZh: '南京大学', nameAr: 'جامعة نانجينغ', city: 'Nanjing', cityAr: 'نانجينغ', province: 'Jiangsu', provinceAr: 'جيانغسو', universityType: DFC, qs: v('90') },
  { nameEn: 'Wuhan University', aliases: ['WHU'], nameZh: '武汉大学', nameAr: 'جامعة ووهان', city: 'Wuhan', cityAr: 'ووهان', province: 'Hubei', provinceAr: 'هوبي', universityType: DFC, qs: v('165') },
  { nameEn: 'Harbin Institute of Technology', aliases: ['HIT'], nameZh: '哈尔滨工业大学', nameAr: 'معهد هاربين للتكنولوجيا', city: 'Harbin', cityAr: 'هاربين', province: 'Heilongjiang', provinceAr: 'هيلونغجيانغ', universityType: DFC, qs: v('190') },

  // ── QS ranked (single source / conflicting — Admin must confirm) ─────────
  { nameEn: 'University of Science and Technology of China', aliases: ['USTC'], nameZh: '中国科学技术大学', nameAr: 'جامعة العلوم والتكنولوجيا الصينية', city: 'Hefei', cityAr: 'خفي', province: 'Anhui', provinceAr: 'آنهوي', universityType: DFC, qs: u('133') },
  { nameEn: 'Tongji University', nameZh: '同济大学', nameAr: 'جامعة تونغجي', city: 'Shanghai', cityAr: 'شانغهاي', province: 'Shanghai', provinceAr: 'شانغهاي', universityType: DFC, qs: u('140') },
  { nameEn: 'Tianjin University', nameZh: '天津大学', nameAr: 'جامعة تيانجين', city: 'Tianjin', cityAr: 'تيانجين', province: 'Tianjin', provinceAr: 'تيانجين', universityType: DFC, qs: u('235') },
  { nameEn: 'Beijing Normal University', aliases: ['BNU'], nameZh: '北京师范大学', nameAr: 'جامعة بكين للمعلمين', city: 'Beijing', cityAr: 'بكين', province: 'Beijing', provinceAr: 'بكين', universityType: DFC, qs: u('237') },
  { nameEn: 'Beijing Institute of Technology', aliases: ['BIT'], nameZh: '北京理工大学', nameAr: 'معهد بكين للتكنولوجيا', city: 'Beijing', cityAr: 'بكين', province: 'Beijing', provinceAr: 'بكين', universityType: DFC, qs: u('243') },
  { nameEn: 'Sun Yat-sen University', aliases: ['SYSU', 'Sun Yat-Sen University', 'Zhongshan University'], nameZh: '中山大学', nameAr: 'جامعة صن يات سين', city: 'Guangzhou', cityAr: 'قوانغتشو', province: 'Guangdong', provinceAr: 'قوانغدونغ', universityType: DFC, qs: u('258') },
  { nameEn: "Xi'an Jiaotong University", aliases: ['XJTU', 'Xian Jiaotong University'], nameZh: '西安交通大学', nameAr: 'جامعة شيآن جياوتونغ', city: "Xi'an", cityAr: 'شيآن', province: 'Shaanxi', provinceAr: 'شنشي', universityType: DFC, qs: u('296') },
  { nameEn: 'Huazhong University of Science and Technology', aliases: ['HUST'], nameZh: '华中科技大学', nameAr: 'جامعة هواتشونغ للعلوم والتكنولوجيا', city: 'Wuhan', cityAr: 'ووهان', province: 'Hubei', provinceAr: 'هوبي', universityType: DFC, qs: u('307') },

  // ── Location reference only (no QS rank stored) ──────────────────────────
  { nameEn: 'Sichuan University', nameZh: '四川大学', nameAr: 'جامعة سيتشوان', city: 'Chengdu', cityAr: 'تشنغدو', province: 'Sichuan', provinceAr: 'سيتشوان', universityType: DFC },
  { nameEn: 'Shandong University', nameZh: '山东大学', nameAr: 'جامعة شاندونغ', city: 'Jinan', cityAr: 'جينان', province: 'Shandong', provinceAr: 'شاندونغ', universityType: DFC },
  { nameEn: 'Xiamen University', nameZh: '厦门大学', nameAr: 'جامعة شيامن', city: 'Xiamen', cityAr: 'شيامن', province: 'Fujian', provinceAr: 'فوجيان', universityType: DFC },
  { nameEn: 'Southeast University', nameZh: '东南大学', nameAr: 'جامعة جنوب شرق الصين', city: 'Nanjing', cityAr: 'نانجينغ', province: 'Jiangsu', provinceAr: 'جيانغسو', universityType: DFC },
  { nameEn: 'Nankai University', nameZh: '南开大学', nameAr: 'جامعة نانكاي', city: 'Tianjin', cityAr: 'تيانجين', province: 'Tianjin', provinceAr: 'تيانجين', universityType: DFC },
  { nameEn: 'Beihang University', aliases: ['Beijing University of Aeronautics and Astronautics', 'BUAA'], nameZh: '北京航空航天大学', nameAr: 'جامعة بيهانغ', city: 'Beijing', cityAr: 'بكين', province: 'Beijing', provinceAr: 'بكين', universityType: DFC },
  { nameEn: 'Renmin University of China', aliases: ['RUC'], nameZh: '中国人民大学', nameAr: 'جامعة رنمين الصينية', city: 'Beijing', cityAr: 'بكين', province: 'Beijing', provinceAr: 'بكين', universityType: DFC },
  { nameEn: 'China Agricultural University', nameZh: '中国农业大学', nameAr: 'جامعة الصين الزراعية', city: 'Beijing', cityAr: 'بكين', province: 'Beijing', provinceAr: 'بكين', universityType: DFC },
  { nameEn: 'Beijing Jiaotong University', nameZh: '北京交通大学', nameAr: 'جامعة بكين جياوتونغ', city: 'Beijing', cityAr: 'بكين', province: 'Beijing', provinceAr: 'بكين', universityType: DFC },
  { nameEn: 'Beijing Language and Culture University', aliases: ['BLCU'], nameZh: '北京语言大学', nameAr: 'جامعة بكين للغات والثقافة', city: 'Beijing', cityAr: 'بكين', province: 'Beijing', provinceAr: 'بكين', universityType: PUB },
  { nameEn: 'Capital Medical University', nameZh: '首都医科大学', nameAr: 'جامعة العاصمة الطبية', city: 'Beijing', cityAr: 'بكين', province: 'Beijing', provinceAr: 'بكين', universityType: PUB },
  { nameEn: 'East China Normal University', aliases: ['ECNU'], nameZh: '华东师范大学', nameAr: 'جامعة شرق الصين للمعلمين', city: 'Shanghai', cityAr: 'شانغهاي', province: 'Shanghai', provinceAr: 'شانغهاي', universityType: DFC },
  { nameEn: 'Shanghai University', nameZh: '上海大学', nameAr: 'جامعة شانغهاي', city: 'Shanghai', cityAr: 'شانغهاي', province: 'Shanghai', provinceAr: 'شانغهاي', universityType: PUB },
  { nameEn: 'Donghua University', nameZh: '东华大学', nameAr: 'جامعة دونغهوا', city: 'Shanghai', cityAr: 'شانغهاي', province: 'Shanghai', provinceAr: 'شانغهاي', universityType: PUB },
  { nameEn: 'Jilin University', nameZh: '吉林大学', nameAr: 'جامعة جيلين', city: 'Changchun', cityAr: 'تشانغتشون', province: 'Jilin', provinceAr: 'جيلين', universityType: DFC },
  { nameEn: 'Northeast Normal University', nameZh: '东北师范大学', nameAr: 'جامعة شمال شرق الصين للمعلمين', city: 'Changchun', cityAr: 'تشانغتشون', province: 'Jilin', provinceAr: 'جيلين', universityType: PUB },
  { nameEn: 'Central South University', nameZh: '中南大学', nameAr: 'جامعة وسط الجنوب', city: 'Changsha', cityAr: 'تشانغشا', province: 'Hunan', provinceAr: 'هونان', universityType: DFC },
  { nameEn: 'Hunan University', nameZh: '湖南大学', nameAr: 'جامعة هونان', city: 'Changsha', cityAr: 'تشانغشا', province: 'Hunan', provinceAr: 'هونان', universityType: DFC },
  { nameEn: 'South China University of Technology', aliases: ['SCUT'], nameZh: '华南理工大学', nameAr: 'جامعة جنوب الصين للتكنولوجيا', city: 'Guangzhou', cityAr: 'قوانغتشو', province: 'Guangdong', provinceAr: 'قوانغدونغ', universityType: DFC },
  { nameEn: 'Southern University of Science and Technology', aliases: ['SUSTech'], nameZh: '南方科技大学', nameAr: 'جامعة الجنوب للعلوم والتكنولوجيا', city: 'Shenzhen', cityAr: 'شنتشن', province: 'Guangdong', provinceAr: 'قوانغدونغ', universityType: PUB },
  { nameEn: 'Shenzhen University', nameZh: '深圳大学', nameAr: 'جامعة شنتشن', city: 'Shenzhen', cityAr: 'شنتشن', province: 'Guangdong', provinceAr: 'قوانغدونغ', universityType: PUB },
  { nameEn: 'Dalian University of Technology', nameZh: '大连理工大学', nameAr: 'جامعة داليان للتكنولوجيا', city: 'Dalian', cityAr: 'داليان', province: 'Liaoning', provinceAr: 'لياونينغ', universityType: DFC },
  { nameEn: 'Northeastern University', aliases: ['Northeastern University China'], nameZh: '东北大学', nameAr: 'جامعة شمال شرق الصين', city: 'Shenyang', cityAr: 'شنيانغ', province: 'Liaoning', provinceAr: 'لياونينغ', universityType: DFC },
  { nameEn: 'China Medical University', nameZh: '中国医科大学', nameAr: 'جامعة الصين الطبية', city: 'Shenyang', cityAr: 'شنيانغ', province: 'Liaoning', provinceAr: 'لياونينغ', universityType: PUB },
  { nameEn: 'Liaoning University', nameZh: '辽宁大学', nameAr: 'جامعة لياونينغ', city: 'Shenyang', cityAr: 'شنيانغ', province: 'Liaoning', provinceAr: 'لياونينغ', universityType: PUB },
  { nameEn: 'Chongqing University', nameZh: '重庆大学', nameAr: 'جامعة تشونغتشينغ', city: 'Chongqing', cityAr: 'تشونغتشينغ', province: 'Chongqing', provinceAr: 'تشونغتشينغ', universityType: DFC },
  { nameEn: 'Lanzhou University', nameZh: '兰州大学', nameAr: 'جامعة لانتشو', city: 'Lanzhou', cityAr: 'لانتشو', province: 'Gansu', provinceAr: 'قانسو', universityType: DFC },
  { nameEn: 'Northwestern Polytechnical University', aliases: ['NWPU'], nameZh: '西北工业大学', nameAr: 'جامعة شمال غرب الصين التقنية', city: "Xi'an", cityAr: 'شيآن', province: 'Shaanxi', provinceAr: 'شنشي', universityType: DFC },
  { nameEn: 'University of Electronic Science and Technology of China', aliases: ['UESTC'], nameZh: '电子科技大学', nameAr: 'جامعة العلوم والتكنولوجيا الإلكترونية الصينية', city: 'Chengdu', cityAr: 'تشنغدو', province: 'Sichuan', provinceAr: 'سيتشوان', universityType: DFC },
  { nameEn: 'Southwest Jiaotong University', nameZh: '西南交通大学', nameAr: 'جامعة جنوب غرب جياوتونغ', city: 'Chengdu', cityAr: 'تشنغدو', province: 'Sichuan', provinceAr: 'سيتشوان', universityType: PUB },
  { nameEn: 'Zhengzhou University', nameZh: '郑州大学', nameAr: 'جامعة تشنغتشو', city: 'Zhengzhou', cityAr: 'تشنغتشو', province: 'Henan', provinceAr: 'خنان', universityType: PUB },
  { nameEn: 'Soochow University', aliases: ['Suzhou University'], nameZh: '苏州大学', nameAr: 'جامعة سوتشو', city: 'Suzhou', cityAr: 'سوتشو', province: 'Jiangsu', provinceAr: 'جيانغسو', universityType: PUB },
  { nameEn: 'Nanjing University of Aeronautics and Astronautics', aliases: ['NUAA'], nameZh: '南京航空航天大学', nameAr: 'جامعة نانجينغ للملاحة الجوية والفضائية', city: 'Nanjing', cityAr: 'نانجينغ', province: 'Jiangsu', provinceAr: 'جيانغسو', universityType: PUB },
  { nameEn: 'Hohai University', nameZh: '河海大学', nameAr: 'جامعة هوهاي', city: 'Nanjing', cityAr: 'نانجينغ', province: 'Jiangsu', provinceAr: 'جيانغسو', universityType: PUB },
  { nameEn: 'Jiangsu University', nameZh: '江苏大学', nameAr: 'جامعة جيانغسو', city: 'Zhenjiang', cityAr: 'تشنجيانغ', province: 'Jiangsu', provinceAr: 'جيانغسو', universityType: PUB },
  { nameEn: 'Yangzhou University', nameZh: '扬州大学', nameAr: 'جامعة يانغتشو', city: 'Yangzhou', cityAr: 'يانغتشو', province: 'Jiangsu', provinceAr: 'جيانغسو', universityType: PUB },
  { nameEn: 'Ningbo University', nameZh: '宁波大学', nameAr: 'جامعة نينغبو', city: 'Ningbo', cityAr: 'نينغبو', province: 'Zhejiang', provinceAr: 'تشجيانغ', universityType: PUB },
  { nameEn: 'Zhejiang Normal University', nameZh: '浙江师范大学', nameAr: 'جامعة تشجيانغ للمعلمين', city: 'Jinhua', cityAr: 'جينهوا', province: 'Zhejiang', provinceAr: 'تشجيانغ', universityType: PUB },
  { nameEn: 'Wenzhou Medical University', nameZh: '温州医科大学', nameAr: 'جامعة ونتشو الطبية', city: 'Wenzhou', cityAr: 'ونتشو', province: 'Zhejiang', provinceAr: 'تشجيانغ', universityType: PUB },
  { nameEn: 'Anhui University', nameZh: '安徽大学', nameAr: 'جامعة آنهوي', city: 'Hefei', cityAr: 'خفي', province: 'Anhui', provinceAr: 'آنهوي', universityType: PUB },
  { nameEn: 'Nanchang University', nameZh: '南昌大学', nameAr: 'جامعة نانتشانغ', city: 'Nanchang', cityAr: 'نانتشانغ', province: 'Jiangxi', provinceAr: 'جيانغشي', universityType: PUB },
  { nameEn: 'Ocean University of China', nameZh: '中国海洋大学', nameAr: 'جامعة المحيط الصينية', city: 'Qingdao', cityAr: 'تشينغداو', province: 'Shandong', provinceAr: 'شاندونغ', universityType: DFC },
  { nameEn: 'Qingdao University', nameZh: '青岛大学', nameAr: 'جامعة تشينغداو', city: 'Qingdao', cityAr: 'تشينغداو', province: 'Shandong', provinceAr: 'شاندونغ', universityType: PUB },
  { nameEn: 'Tianjin Medical University', nameZh: '天津医科大学', nameAr: 'جامعة تيانجين الطبية', city: 'Tianjin', cityAr: 'تيانجين', province: 'Tianjin', provinceAr: 'تيانجين', universityType: PUB },
  { nameEn: 'Harbin Engineering University', nameZh: '哈尔滨工程大学', nameAr: 'جامعة هاربين للهندسة', city: 'Harbin', cityAr: 'هاربين', province: 'Heilongjiang', provinceAr: 'هيلونغجيانغ', universityType: PUB },
  { nameEn: 'Guangxi University', nameZh: '广西大学', nameAr: 'جامعة قوانغشي', city: 'Nanning', cityAr: 'نانينغ', province: 'Guangxi', provinceAr: 'قوانغشي', universityType: PUB },
  { nameEn: 'Yunnan University', nameZh: '云南大学', nameAr: 'جامعة يونان', city: 'Kunming', cityAr: 'كونمينغ', province: 'Yunnan', provinceAr: 'يونان', universityType: PUB },
  { nameEn: 'Hainan University', nameZh: '海南大学', nameAr: 'جامعة هاينان', city: 'Haikou', cityAr: 'هايكو', province: 'Hainan', provinceAr: 'هاينان', universityType: PUB },
  { nameEn: 'Xinjiang University', nameZh: '新疆大学', nameAr: 'جامعة شينجيانغ', city: 'Urumqi', cityAr: 'أورومتشي', province: 'Xinjiang', provinceAr: 'شينجيانغ', universityType: PUB },
  { nameEn: 'Inner Mongolia University', nameZh: '内蒙古大学', nameAr: 'جامعة منغوليا الداخلية', city: 'Hohhot', cityAr: 'هوهوت', province: 'Inner Mongolia', provinceAr: 'منغوليا الداخلية', universityType: PUB },
];
