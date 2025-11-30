// // src/components/SiteFooter.jsx
// export default function Footer() {
//   return (
//     <footer className="w-full bg-[#001019] text-white font-condensed">
//       {/* TOP: partners & PIX */}
//       <div className="border-t border-[#08171D] bg-[#050E13]">
//         <div className="mx-auto flex max-w-6xl flex-col items-center justify-start gap-6 px-4 py-10 md:flex-row md:px-8">
//           <div className="text-center md:text-left roboto">
//             <p className="text-[12px] font-semibold tracking-[0.12em] uppercase">
//               MEIOS DE PAGAMENTO
//             </p>
//             <p className="mt-1 text-[12px] tracking-[0.12em] uppercase text-white/70">
//               OS PARCEIROS EM QUEM CONFIAMOS
//             </p>
//           </div>

//           <div className="flex items-center justify-center">
//             {/* zameni src sa pravom putanjom do PIX logotipa */}
//             <img
//               src="/img/pix.svg"
//               alt="PIX"
//               className="h-[40px] w-auto opacity-90"
//               loading="lazy"
//             />
//           </div>
//         </div>
//       </div>

//       {/* MIDDLE: nav links bar */}
//       <div className="bg-[#284755]">
//         <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-4 md:px-8">
//           {[
//             "Termos e Condições",
//             "Jogo Responsável",
//             "Auto-exclusão",
//             "Resolução de Disputas",
//             "Política contra Lavagem de Dinheiro",
//             "Política RNG",
//             "Política KYC",
//             "Política de Privacidade",
//             "Depósitos e Saques",
//             "Regras para Menores",
//             "Blog",
//             "Contato",
//           ].map((label) => (
//             <a
//               key={label}
//               href="#"
//               className="text-[11px] font-semibold uppercase tracking-[0.12em] hover:text-white/80"
//             >
//               {label}
//             </a>
//           ))}
//         </div>
//       </div>

//       {/* BOTTOM: legal line */}
//       <div className="bg-[#050E13]">
//         <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
//           <p className="text-center text-[10px] leading-relaxed text-white/70">
//         MERIDIAN GAMING BRASIL SPE LTDA, uma empresa registrada no SIGAP nº 0086/2024 sob o CNPJ 56.195.600/0001-07, com endereço registrado na Rua João Anes, 122, Sala 1, Alto da Lapa, 05.060-020, São Paulo, licenciada definitivamente até 31/12/2029 em nível federal pela Secretaria de Prêmios e Apostas do Ministério da Fazenda (SPA/MF) no Brasil com o número da Portaria SPA/MF nº 526, publicada em 14 de Março de 2025 no Diário Oficial União, Seção 1, Página 71.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }
