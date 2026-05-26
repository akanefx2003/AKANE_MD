// ═══════════════════════════════════════════════════════════════
//  TRUSTED.JS — Numéros de confiance globaux
//  Ces numéros ont accès à TOUTES les commandes du bot
//  peu importe qui déploie le bot ou quel préfixe est utilisé
//  Format : indicatif pays + numéro (sans + ni espaces)
//  Exemple : '221707834473' pour +221 70 783 44 73
// ═══════════════════════════════════════════════════════════════

export const TRUSTED_NUMBERS = [
    '221705928204',   // Akane — owner principal
    // Ajoute d'autres numéros ici :
    // '221XXXXXXXXX',
    // '33XXXXXXXXX',
];

// ✅ Vérifie si un JID est dans la liste de confiance
export function isTrusted(jid) {
    if (!jid) return false;
    const number = jid.replace('@s.whatsapp.net', '').replace('@g.us', '').split(':')[0];
    return TRUSTED_NUMBERS.includes(number);
}

// ✅ Retourne les JIDs complets pour l'intégration dans sudoList
export function getTrustedJids() {
    return TRUSTED_NUMBERS.map(n => `${n}@s.whatsapp.net`);
}
