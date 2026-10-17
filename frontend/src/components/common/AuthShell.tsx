import {ReactNode} from "react";

function useDocumentTitle(s: string) {

}

// export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
//     useDocumentTitle(`${title} | GO Cook`);
//
//     return (
//         <SiteLayout>
//             <main id="main">
//                 <div className="container">
//                     <div className="auth">
//                         <aside className="auth-visual">
//                             <img src="/assets/family.png" alt="Gia đình quây quần bên bữa cơm" />
//                             <div className="copy">
//                                 <h2>Bếp ấm.<br />Cơm ngon.<br />Nhà mình sum vầy.</h2>
//                                 <p>Để GO Cook chăm bữa ăn, bạn dành thời gian cho những người mình thương.</p>
//                             </div>
//                         </aside>
//                         <section className="card auth-form stack">{children}</section>
//                     </div>
//                 </div>
//             </main>
//         </SiteLayout>
//     );
// }