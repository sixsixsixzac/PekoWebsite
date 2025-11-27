// Base interfaces for Prisma models
// These interfaces represent the base structure of each model without relations

// Decimal type from Prisma (can be used as number in most cases)
export type PrismaDecimal = number | string | { valueOf(): string }

// Enums
export type AnnouncementStatus = 'draft' | 'published' | 'archived'
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent'
export type CartoonType = 'manga' | 'novel'
export type CartoonStatus = 'active' | 'deleted'
export type CommentStatus = 'active' | 'deleted' | 'hidden'
export type ImageProtection = 'on' | 'off'
export type PublishStatus = 'now' | 'schedule' | 'hide'
export type ShopItemStatus = 'on' | 'off'
export type TopupPackageStatus = 'deleted' | 'show' | 'hide'
export type TransactionStatus = 'pending' | 'completed' | 'failed'
export type UserDetailStatus = 'pending' | 'approve' | 'reject'
export type WithdrawStatus = 'success' | 'deny' | 'pending' | 'deleted'

// Model Base Interfaces
export interface AnnouncementBase {
  id: bigint
  title: string
  content: string
  status: AnnouncementStatus
  priority: AnnouncementPriority
  publishedAt: Date | null
  expiresAt: Date | null
  createdBy: number
  updatedBy: number | null
  createdAt: Date | null
  updatedAt: Date | null
}

export interface AuditLogBase {
  id: bigint
  userId: number | null
  action: string
  resourceType: string | null
  resourceId: string | null
  ipAddress: string | null
  userAgent: string | null
  requestData: any | null
  responseData: any | null
  status: string
  message: string | null
  metadata: any | null
  createdAt: Date | null
  updatedAt: Date | null
}

export interface CacheBase {
  key: string
  value: string
  expiration: number
}

export interface CarouselBase {
  id: bigint
  title: string
  subtitle: string | null
  image: string
  link: string | null
  textAlignment: string
  isActive: boolean
  sortOrder: number
  createdAt: Date | null
  updatedAt: Date | null
}

export interface CartoonBase {
  pId: number
  title: string
  description: string
  coverImage: string
  authorId: number
  pDate: Date
  updatedAt: Date
  createdAt: Date
  uuid: string | null
  categoryMain: number
  categorySub: number
  type: CartoonType
  originType: number
  ageRate: string
  publishStatus: number
  completionStatus: number
  status: CartoonStatus
  banned: string | null
}

export interface CartoonCommentBase {
  id: bigint
  cartoonId: number
  episodeId: number | null
  userId: bigint
  parentId: bigint | null
  content: string
  status: CommentStatus
  likesCount: number
  repliesCount: bigint
  createdAt: Date | null
  updatedAt: Date | null
}

export interface CategoryBase {
  id: number
  categoryName: string
  status: number
  createdAt: Date
}

export interface CommentLikeBase {
  id: bigint
  commentId: bigint
  userId: bigint
  createdAt: Date | null
  updatedAt: Date | null
}

export interface EpShopBase {
  epsId: number
  epId: number | null
  epNo: number
  point: number
  remainPoint: number
  userId: number
  lockAfterDatetime: Date | null
  createdAt: Date
}

export interface MangaCategoryBase {
  id: number
  pId: number | null
  categoryId: number | null
}

export interface MangaEpBase {
  epId: number
  pId: number
  epName: string
  epContent: string | null
  epNo: number
  epPrice: number
  totalImage: number
  imageProtection: ImageProtection
  publishStatus: PublishStatus
  scheduleDatetime: Date | null
  lockDurationDays: number | null
  status: CartoonStatus
  createAt: Date
  updatedAt: Date
}

export interface MangaEpImageBase {
  epiId: number
  epNo: number
  pId: number
  epiImageName: string
  json: any | null
}

export interface MangaEpViewBase {
  id: bigint
  pId: number
  epNo: number
  userId: bigint | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

export interface MangaFavoriteBase {
  id: number
  pId: number
  userId: number
  createdAt: Date
}

export interface MigrationBase {
  id: number
  migration: string
  batch: number
}

export interface NotificationBase {
  id: string
  type: string
  notifiableType: string
  notifiableId: bigint
  data: string
  readAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null
}

export interface PasswordResetTokenBase {
  email: string
  token: string
  createdAt: Date | null
}

export interface SessionBase {
  id: string
  userId: bigint | null
  ipAddress: string | null
  userAgent: string | null
  payload: string
  lastActivity: number
}

export interface ShopItemBase {
  itemId: number
  itemTitle: string
  itemDetail: string
  itemPrice: bigint
  itemImg: string
  itemType: string
  itemStatus: ShopItemStatus
}

export interface ShopItemUserBase {
  siuId: number
  itemId: number
  uName: string | null
  userId: number | null
  siuDate: Date
  siuTime: Date
  siuStatus: string
  itemType: string
  createdAt: Date
}

export interface TopupPackageBase {
  id: number
  coinAmount: number
  bonus: number
  price: PrismaDecimal
  status: TopupPackageStatus
  createdAt: Date
  updatedAt: Date
}

export interface TopupTransactionBase {
  id: number
  userId: number
  packageId: number
  refId: string
  transactionId: number
  paymentMethod: string
  amountPaid: PrismaDecimal
  coinsAdded: number
  status: TransactionStatus
  createdAt: Date
  updatedAt: Date
}

export interface UserBanBase {
  id: bigint
  userId: number
  reason: string | null
  unbannedAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null
}

export interface UserDetailBase {
  id: bigint
  userId: number
  bankNumber: string
  bankName: string
  bankType: string | null
  bankImage: string | null
  userPhone: string | null
  userPrefix: string | null
  firstName: string
  lastName: string
  fanPageLink: string | null
  status: UserDetailStatus
  rejectReason: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserFollowerBase {
  id: bigint
  followerId: number
  followingId: number
  createdAt: Date | null
  updatedAt: Date | null
}

export interface UserProfileBase {
  id: number
  uuid: string
  level: number
  uStatus: number
  uName: string
  displayName: string
  point: number
  sales: number
  pWord: string
  uFlname: string | null
  email: string
  uPhone: string | null
  userImg: string
  autoEpisodePurchase: boolean
  loadAllImages: boolean
  createdAt: Date
  updatedAt: Date
  googleId: string | null
  googleToken: string | null
  socialMedia: string | null
  emailVerifiedAt: Date | null
  emailVerificationToken: string | null
  rememberToken: string | null
}

export interface WebContactBase {
  id: number
  label: string
  url: string
  iconClass: string | null
  createdAt: Date
  updatedAt: Date
}

export interface WebSettingBase {
  key: string
  value: string | null
  updatedAt: Date
}

export interface WithdrawMoneyBase {
  id: number
  userId: number
  currentRate: number
  amount: number
  fee: PrismaDecimal
  status: WithdrawStatus
  reason: string | null
  updatedAt: Date
  createdAt: Date
}

