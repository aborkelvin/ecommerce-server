export enum eCartStatus {
    ACTIVE = 'ACTIVE',          // User is currently shopping/adding items
    // ABANDONED = 'ABANDONED',    // User left items in cart and did not check out (optional but useful for analytics) (Or just use pending_ccheckout but create date is more than 30 days for this since user cant really start new cart until one has been moved)
    PENDING_CHECKOUT = 'PENDING_CHECKOUT', // User started the checkout process (e.g., entered shipping info)
    CONVERTED_TO_ORDER = 'CONVERTED_TO_ORDER', // Cart successfully turned into an Order entity
    EXPIRED = 'EXPIRED',        // Cart session expired
}