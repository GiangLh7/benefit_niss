/**
 * Hazardous Industries Constants
 * Configurable list of hazardous industries for early retirement eligibility
 */

import { HazardousIndustry } from '../models/benefit.model';

/**
 * List of hazardous industries that qualify for early retirement
 * This list can be configured and updated as needed
 */
export const HAZARDOUS_INDUSTRIES: HazardousIndustry[] = [
  {
    id: 'mining',
    name: 'Khai thác mỏ',
    description: 'Công nghiệp khai thác mỏ và khoáng sản'
  },
  {
    id: 'chemical',
    name: 'Hóa chất độc hại',
    description: 'Sản xuất và xử lý hóa chất nguy hiểm'
  },
  {
    id: 'construction',
    name: 'Xây dựng cao tầng',
    description: 'Xây dựng và làm việc ở độ cao'
  },
  {
    id: 'radiation',
    name: 'Phóng xạ',
    description: 'Làm việc với vật liệu phóng xạ'
  },
  {
    id: 'underwater',
    name: 'Dưới nước',
    description: 'Thợ lặn và công việc dưới nước'
  },
  {
    id: 'firefighting',
    name: 'Chữa cháy',
    description: 'Lính cứu hỏa và ứng cứu khẩn cấp'
  }
];

