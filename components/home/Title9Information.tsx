// "use client"

// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// export default function Title9Page() {
//   return (
//     <div className="space-y-8">
//       <div className="max-w-3xl mx-auto">
//         <h2 className="text-2xl font-bold mb-6">Title IX Information</h2>

//         <div className="mb-8">
//           <p className="mb-4">
//             Desert Area Resources and Training (DART) is committed to providing an environment free from discrimination
//             on the basis of sex, including sexual harassment and sexual violence. Title IX of the Education Amendments
//             of 1972 prohibits discrimination on the basis of sex in education programs and activities.
//           </p>
//           <p>
//             This page provides information about DART's policies and procedures related to Title IX, resources for
//             reporting incidents, and contact information for our Title IX Coordinator.
//           </p>
//         </div>

//         <div className="mb-8">
//           <h3 className="text-xl font-semibold mb-4">Title IX Coordinator</h3>
//           <div className="bg-gray-50 p-4 rounded-md">
//             <p className="font-medium">Jane Smith</p>
//             <p>Title IX Coordinator</p>
//             <p>Email: titleix@dart.org</p>
//             <p>Phone: (555) 123-4567</p>
//             <p>Office: Administration Building, Room 203</p>
//           </div>
//         </div>

//         <Accordion type="single" collapsible className="mb-8">
//           <AccordionItem value="definitions">
//             <AccordionTrigger className="text-lg font-medium">Definitions</AccordionTrigger>
//             <AccordionContent>
//               <div className="space-y-4 text-sm">
//                 <div>
//                   <h4 className="font-semibold">Sexual Harassment</h4>
//                   <p>
//                     Unwelcome conduct of a sexual nature that is sufficiently severe, persistent, or pervasive to
//                     interfere with or limit a person's ability to participate in or benefit from DART's programs or
//                     activities.
//                   </p>
//                 </div>
//                 <div>
//                   <h4 className="font-semibold">Sexual Violence</h4>
//                   <p>
//                     Physical sexual acts perpetrated against a person's will or where a person is incapable of giving
//                     consent due to the victim's use of drugs or alcohol or due to an intellectual or other disability.
//                   </p>
//                 </div>
//                 <div>
//                   <h4 className="font-semibold">Consent</h4>
//                   <p>
//                     Affirmative, conscious, and voluntary agreement to engage in sexual activity. Consent can be
//                     withdrawn at any time.
//                   </p>
//                 </div>
//                 <div>
//                   <h4 className="font-semibold">Retaliation</h4>
//                   <p>
//                     Adverse action taken against an individual because of their report of sexual harassment or
//                     participation in an investigation or proceeding related to sexual misconduct.
//                   </p>
//                 </div>
//               </div>
//             </AccordionContent>
//           </AccordionItem>

//           <AccordionItem value="reporting">
//             <AccordionTrigger className="text-lg font-medium">Reporting Procedures</AccordionTrigger>
//             <AccordionContent>
//               <div className="space-y-4 text-sm">
//                 <p>
//                   Any person may report sex discrimination, including sexual harassment, to the Title IX Coordinator,
//                   regardless of whether the person reporting is the person alleged to be the victim of conduct that
//                   could constitute sex discrimination or sexual harassment.
//                 </p>
//                 <p>
//                   Reports can be made in person, by mail, by telephone, or by email to the Title IX Coordinator, or by
//                   any other means that results in the Title IX Coordinator receiving the person's verbal or written
//                   report.
//                 </p>
//                 <h4 className="font-semibold mt-4">Confidential Resources</h4>
//                 <p>
//                   Individuals who wish to discuss a concern without instituting a formal investigation may speak with:
//                 </p>
//                 <ul className="list-disc pl-5 space-y-1">
//                   <li>DART Counseling Services: (555) 123-4568</li>
//                   <li>Community Crisis Center: (555) 123-4569</li>
//                   <li>Employee Assistance Program: (555) 123-4570</li>
//                 </ul>
//               </div>
//             </AccordionContent>
//           </AccordionItem>

//           <AccordionItem value="investigation">
//             <AccordionTrigger className="text-lg font-medium">Investigation Process</AccordionTrigger>
//             <AccordionContent>
//               <div className="space-y-4 text-sm">
//                 <p>Upon receipt of a formal complaint, DART will:</p>
//                 <ol className="list-decimal pl-5 space-y-2">
//                   <li>Provide written notice to all known parties</li>
//                   <li>Conduct a thorough and impartial investigation</li>
//                   <li>Allow both parties to present witnesses and evidence</li>
//                   <li>Provide both parties equal access to all evidence gathered</li>
//                   <li>Issue a written determination regarding responsibility</li>
//                   <li>Provide information about the appeal process</li>
//                 </ol>
//                 <p className="mt-4">
//                   The investigation will be completed within 60 days, unless there are extenuating circumstances that
//                   require additional time.
//                 </p>
//               </div>
//             </AccordionContent>
//           </AccordionItem>

//           <AccordionItem value="supportive">
//             <AccordionTrigger className="text-lg font-medium">Supportive Measures</AccordionTrigger>
//             <AccordionContent>
//               <div className="space-y-4 text-sm">
//                 <p>
//                   DART offers various supportive measures to individuals involved in Title IX matters, which may
//                   include:
//                 </p>
//                 <ul className="list-disc pl-5 space-y-1">
//                   <li>Counseling services</li>
//                   <li>Extensions of deadlines or other course-related adjustments</li>
//                   <li>Modifications of work or class schedules</li>
//                   <li>Campus escort services</li>
//                   <li>Mutual restrictions on contact between the parties</li>
//                   <li>Changes in work or housing locations</li>
//                   <li>Leaves of absence</li>
//                   <li>Increased security and monitoring of certain areas of the campus</li>
//                 </ul>
//                 <p className="mt-4">
//                   Supportive measures are available regardless of whether a formal complaint is filed.
//                 </p>
//               </div>
//             </AccordionContent>
//           </AccordionItem>
//         </Accordion>

//         <div className="mb-8">
//           <h3 className="text-xl font-semibold mb-4">Title IX Policy Documents</h3>
//           <div className="space-y-2">
//             <div className="flex items-center p-3 border rounded-md hover:bg-gray-50">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 mr-2 text-blue-500"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
//                 />
//               </svg>
//               <a href="#" className="text-blue-600 hover:underline">
//                 Complete Title IX Policy (PDF)
//               </a>
//             </div>
//             <div className="flex items-center p-3 border rounded-md hover:bg-gray-50">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 mr-2 text-blue-500"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
//                 />
//               </svg>
//               <a href="#" className="text-blue-600 hover:underline">
//                 Sexual Misconduct Reporting Form (PDF)
//               </a>
//             </div>
//             <div className="flex items-center p-3 border rounded-md hover:bg-gray-50">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 mr-2 text-blue-500"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
//                 />
//               </svg>
//               <a href="#" className="text-blue-600 hover:underline">
//                 Resource Guide for Victims (PDF)
//               </a>
//             </div>
//           </div>
//         </div>

//         <div className="mb-8">
//           <h3 className="text-xl font-semibold mb-4">Training Materials</h3>
//           <p className="mb-4">
//             In accordance with Title IX regulations, DART makes all materials used to train Title IX Coordinators,
//             investigators, decision-makers, and facilitators of informal resolution processes publicly available.
//           </p>
//           <div className="space-y-2">
//             <div className="flex items-center p-3 border rounded-md hover:bg-gray-50">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 mr-2 text-blue-500"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
//                 />
//               </svg>
//               <a href="#" className="text-blue-600 hover:underline">
//                 Title IX Coordinator Training Materials
//               </a>
//             </div>
//             <div className="flex items-center p-3 border rounded-md hover:bg-gray-50">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 mr-2 text-blue-500"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
//                 />
//               </svg>
//               <a href="#" className="text-blue-600 hover:underline">
//                 Investigator Training Materials
//               </a>
//             </div>
//             <div className="flex items-center p-3 border rounded-md hover:bg-gray-50">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 mr-2 text-blue-500"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
//                 />
//               </svg>
//               <a href="#" className="text-blue-600 hover:underline">
//                 Decision-Maker Training Materials
//               </a>
//             </div>
//           </div>
//         </div>

//         <div className="bg-blue-50 p-6 rounded-lg">
//           <h3 className="text-xl font-semibold mb-4 text-blue-800">Additional Resources</h3>
//           <div className="space-y-4">
//             <div>
//               <h4 className="font-medium text-blue-700">National Resources</h4>
//               <ul className="mt-2 space-y-1">
//                 <li>
//                   <a
//                     href="https://www.rainn.org/"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 hover:underline"
//                   >
//                     RAINN (Rape, Abuse & Incest National Network)
//                   </a>
//                 </li>
//                 <li>
//                   <a
//                     href="https://www.nsvrc.org/"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 hover:underline"
//                   >
//                     National Sexual Violence Resource Center
//                   </a>
//                 </li>
//                 <li>
//                   <a
//                     href="https://www.loveisrespect.org/"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 hover:underline"
//                   >
//                     Love Is Respect
//                   </a>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h4 className="font-medium text-blue-700">Local Resources</h4>
//               <ul className="mt-2 space-y-1">
//                 <li>Local Crisis Center: (555) 123-7890</li>
//                 <li>County Victim Services: (555) 123-7891</li>
//                 <li>Hospital Emergency Department: (555) 123-7892</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
"use client"

export default function Title9Page() {
  return (
    <div className="space-y-6 text-sm">
      <h2 className="text-xl font-bold mb-4">Title VI Information</h2>

      {/* Table of Contents */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Table of Contents</h3>
        <div className="flex">
          <div className="w-4/5">
            <p>Notice to Public</p>
            <p>List of locations where notice is posted</p>
            <p>Title VI Complaint Procedures</p>
            <p>Title VI Complaint Form</p>
            <p>List of transit-related Title VI investigations, complaints and lawsuits</p>
            <p>Public Participation Plan</p>
            <p>Language Assistance Plan</p>
            <p>Four Factor Analysis</p>
            <p>Notice to LEP persons of available language assistance</p>
            <p>Implementation of plan</p>
            <p>Translation of vital documents</p>
            <p>Membership of non-elected committees and councils</p>
            <p>Board of Directors approval of Title VI Plan</p>
          </div>
          <div className="w-1/5 text-right">
            <p>3</p>
            <p>5</p>
            <p>6</p>
            <p>8</p>
            <p>16</p>
            <p>17</p>
            <p>20</p>
            <p>21</p>
            <p>26</p>
            <p>27</p>
            <p>29</p>
            <p>30</p>
            <p>31</p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="mb-6">
        <p className="mb-3">
          This document was prepared by Desert Area Resources and Training, also known as DART, and approved by its
          Board of Directors on June 7, 2014 to comply with Title VI of the Civil Rights Act of 1964, including new
          provisions detailed in U.S. Department of Transportation's FTA Circular 4702.1B, "Title VI Requirement and
          Guidelines for Federal Transit Administration Recipients."
        </p>
      </div>

      {/* Notice to Public */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Notice to Public</h3>
        <div className="bg-[var(--background)] text-[var(--foreground)] p-4 mb-4 border border-[var(--background)]">
          <h4 className="font-semibold mb-2">NOTIFYING THE PUBLIC OF RIGHTS UNDER TITLE VI</h4>
          <h4 className="font-semibold mb-2">DESERT AREA RESOURCES AND TRAINING, also known as DART</h4>
          <ul className="list-disc pl-5 mb-3">
            <li className="mb-2">
              Desert Area Resources and Training, also known as DART, operates its programs and services without regard
              to race, color, and national origin in accordance with Title VI of the Civil Rights act. Any person who
              believes she or he has been aggrieved by any unlawful discriminatory practice under Title VI may file a
              complaint with DART.
            </li>
            <li className="mb-2">
              For more information on DART's civil rights program and the procedures to file a complaint, contact our
              administrative office at 760-375-8797, email titlevicomplaint@dartontarget.org or visit our Administrative
              Office at 201 E. Ridgecrest Blvd., Ridgecrest, 93555. For more information, visit our website,
              www.dartontarget.org.
            </li>
            <li className="mb-2">
              A complainant may file a complaint directly with the Federal Transit Administration by filing it with the
              Office of Civil Rights, Attn: Title VI Program Coordinator, East Building, 5th Floor-TCR, 1200 New Jersey
              Ave. SE Washington, DC 20590.
            </li>
            <li>If information is needed in another language, contact 760-375-9787.</li>
          </ul>
        </div>

        <div className="bg-[var(--background)] text-[var(--foregorund)] p-4 border border-[var(--secondary)]">
          <h4 className="font-semibold mb-2">Notificando al público sobre los derechos bajo el titulo VI</h4>
          <h4 className="font-semibold mb-2">DESERT AREA RESOURCES AND TRAINING, también conocido como DART</h4>
          <ul className="list-disc pl-5 mb-3">
            <li className="mb-2">
              Desert Area Resources and Training, también conocido como DART, opera sus programas y servicios sin
              descrimiacíon de raza, color y nacionalidad de origen. De acuerdo con el titulo VI de la Ley de Derecho
              Civil, cualquier persona qe crea ser ilegalmente agredido por cualquier practica discriminatoria bajo el
              titulo VI puede presenter una queja con Desert Area Resources and Training, también conocido como DART.
            </li>
            <li className="mb-2">
              Para obtener más información sobre el programa de derechos civiles de DART y los procedimientos para
              presentar una queja, comuníquese con nuestra oficina administrativa al 760-375-8797 ó nuestro correo
              electronico titlevicomplaint@dartontarget.org, o visite nuestras oficina administrativa en el 201 E.
              Ridgecrest Blvd., Ridgecrest, 93555. Para obtener más información, visite nuestro sitio web,
              www.dartontarget.org.
            </li>
            <li className="mb-2">
              Un demandante puede presenter una queja directamente con el Federal Transit administration atravez de una
              queja con la Ofice of Civil Rights. Escriba a Title VI Program Coordinator, East Building ,5th Floor-TCR,
              1200 New Jersey Ave., SE, Washington, DC 20590.
            </li>
            <li>Si se necesita información en otro idioma, contacte al 760-375-9787.</li>
          </ul>
        </div>
      </div>

      {/* List of Locations */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">List of Locations Where Title VI Notice is Posted</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              <th className="border p-2 text-left">Location Name</th>
              <th className="border p-2 text-left">Address</th>
              <th className="border p-2 text-left">City</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">
                Therese M. Hall Preschool
                <br />
                Lobby
              </td>
              <td className="border p-2">216 N. Gold Canyon Dr.</td>
              <td className="border p-2">Ridgecrest, CA</td>
            </tr>
            <tr>
              <td className="border p-2">
                Education Center
                <br />
                Central Hallway Bulletin Board
              </td>
              <td className="border p-2">216 N. Gold Canyon Dr.</td>
              <td className="border p-2">Ridgecrest, CA</td>
            </tr>
            <tr>
              <td className="border p-2">
                Administrative Office
                <br />· Hallway Bulletin board
                <br />· Conference Room
                <br />· Transportation Area Board
              </td>
              <td className="border p-2">201 East Ridgecrest Blvd.</td>
              <td className="border p-2">Ridgecrest, CA</td>
            </tr>
            <tr>
              <td className="border p-2">
                DART Thrift Store
                <br />· Employee Break Room
                <br />· Behind Cash Register
              </td>
              <td className="border p-2">345 W. Ridgecrest Blvd.</td>
              <td className="border p-2">Ridgecrest, CA</td>
            </tr>
            <tr>
              <td className="border p-2">
                Coso Junction Rest Area
                <br />
                Employee Break Room
              </td>
              <td className="border p-2">Highway 395</td>
              <td className="border p-2">Coso Junction</td>
            </tr>
            <tr>
              <td className="border p-2">
                Division Creek Rest Area
                <br />
                Employee Break Room
              </td>
              <td className="border p-2">Highway 395</td>
              <td className="border p-2">Independence, CA</td>
            </tr>
            <tr>
              <td className="border p-2">
                Crestview Rest Area
                <br />
                Employee Break Room
              </td>
              <td className="border p-2">Highway 395</td>
              <td className="border p-2">Mammoth, CA</td>
            </tr>
            <tr>
              <td className="border p-2">
                Boron Rest Area
                <br />· Employee Break Rm East Side
                <br />· Employee Break Rm West Side
              </td>
              <td className="border p-2">Highway 58</td>
              <td className="border p-2">Boron, CA</td>
            </tr>
            <tr>
              <td className="border p-2">China Lake Naval Air Weapon Station: Employee Break Room</td>
              <td className="border p-2">1 Administration Circle</td>
              <td className="border p-2">Ridgecrest. CA</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Title VI Complaint Procedures */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Title VI Complaint Procedures</h3>
        <p className="mb-3">
          These procedures are available at www.dartontarget.org and at the Administrative Office of Desert Area
          Resources and Training, also known as DART.
        </p>

        <h4 className="font-semibold mt-4 mb-2">English: Title VI Complaint Procedures</h4>
        <p className="mb-3">
          Desert Area Resources and Training, also known as DART, receives federal dollars and is required to comply
          with Title VI of the Civil rights Act of 1964. This ensures that services and benefits are provided on a
          non-discriminatory basis. DART has a Title VI Complaint Procedure and a process for local disposition of title
          VI complaints that is consistent with guidelines of Federal Transit Administration Circular 4702.1B, October
          1, 2012.
        </p>
        <p className="mb-3">
          Any person who believes she or he has been discriminated against on the basis of race, color, or national
          origin by Desert Area Resources and Training, also known as DART, may file a Title VI complaint by completing
          and submitting the agency's Title VI Complaint Form. Desert Area Resources and Training, also known as DART,
          investigates complaints received no more than 180 days after the alleged incident. Desert Area Resources and
          Training, also known as DART, will only process complaints that are complete.
        </p>
        <p className="mb-3">
          Within 10 business days of receiving the complaint, Desert Area Resources and Training, also known as DART,
          will review it and determine if our office has jurisdiction. The complainant will receive an acknowledgement
          letter informing her/him whether the complaint will be investigated by our office. Desert Area Resources and
          Training, also known as DART, has 30 days to investigate the complaint. The complainant will be notified in
          writing of the cause to any planned extension to the 30-day rule.
        </p>
        <p className="mb-3">
          If more information is needed to resolve the case, Desert Area Resources and Training, also known as DART, may
          contact the complainant. The complainant has 10 business days from the date of the letter to send requested
          information to the investigator assigned to the case. If the investigator is not contacted by the complainant
          or does not receive the additional information within 10 business days, Desert Area Resources and Training,
          also known as DART, can administratively close the case.
        </p>
        <p className="mb-3">
          A case can be administratively closed also if the complainant no longer wishes to pursue their case. After the
          investigator reviews the complaint, she/he will issue one of two letters to the complainant: a closure letter
          or a letter of finding (LOF). A closure letter summarizes the allegations and states that there was not a
          Title VI violation and that the case will be closed. An LOF summarizes the allegations and the interviews
          regarding the alleged incident, and explains whether any disciplinary action, additional training of the staff
          member or other action will occur. If the complainant wishes to appeal the decision, she/he has 10 business
          days after the date of the letter of the LOF to do so.
        </p>
        <p className="mb-3">
          A person also may file a complaint directly with the Federal Transit Administration, at the FTA Office of
          Civil rights, 1200 New Jersey Avenue SE, Washington, DC 20590.
        </p>

        <h4 className="font-semibold mt-4 mb-2">Spanish Translation: Procedimientos de Quejas del Título VI</h4>
        <p className="mb-3">
          Desert Area Resources and Training, también conocido como DART, recibe fondos federales por lo que requiere
          que cumpla con el Título VI de la Ley de derechos civiles del 1964. Esto garantiza que los servicios y los
          beneficios son prestados sobre una base no discriminatoria. DART tiene un Procedimiento de Quejas del Título
          VI y un proceso para la disposición local de las quejas del título VI que sea coherente con las directrices de
          la Federal Transit Administration Circular 4702.1B, del 1º octubre de 2012
        </p>
        <p className="mb-3">
          Cualquier persona que cree que ha sido víctima de discriminación en base a raza, color, u origen nacional por
          parte del Desert Area Resources and Training, también conocido como DART, puede presentar una queja del Título
          VI, completando y enviando el Formulario de Quejas del Título VI de la agencia. Desert Area Resources and
          Training, también conocido como DART, investiga las quejas recibidas no más tardar 180 días después del
          supuesto incidente. Desert Area Resources and Training, también conocido como DART, sólo procesa quejas
          completas.
        </p>
        <p className="mb-3">
          Dentro de los 10 días hábiles de haber recibido la queja, Desert Area Resources and Training, también conocido
          como DART, lo revisará y determinará si nuestra oficina tiene jurisdicción. El demandante recibirá una carta
          recibo informando que la queja será investigada por nuestra oficina. Desert Area Resources and Training,
          también conocido como DART, tiene 30 días para investigar la denuncia. El denunciante será notificado por
          escrito de la causa a cualquier ampliación prevista de la norma de los 30 días.
        </p>
        <p className="mb-3">
          Si se necesita más información para resolver el caso, Desert Area Resources and Training, también conocido
          como DART, pueden comunicarse con la denunciante. El demandante tiene 10 días hábiles desde la fecha de la
          carta a enviar la información solicitada para el investigador asignado al caso. Si el investigador no está en
          contacto con el reclamante o no reciba la información adicional dentro de los 10 días hábiles, Desert Area
          Resources and Training, también conocido como DART, puede cerrar administrativamente el caso.
        </p>
        <p className="mb-3">
          Un caso puede ser cerrado administrativamente también si el autor ya no desea seguir su caso. Después de que
          el investigador revisa la queja, emitir a una de las dos cartas al denunciante: una carta de cierre o una
          carta de la búsqueda (LOF). Una carta de conclusión resumiendo los hechos denunciados, y afirma que no hubo
          una violación del Título VI, y que el caso se cerrará. Un LOF resume los hechos denunciados y las entrevistas
          sobre el supuesto incidente, y explica si alguna acción disciplinaria, la formación adicional del miembro del
          personal u otra acción ocurrirá. Si el demandante desea apelar la decisión, tiene 10 días hábiles después de
          la fecha de la carta de la LOF para hacerlo.
        </p>
        <p className="mb-3">
          Una persona también puede presentar una queja directamente con la Administración Federal de Tránsito, en la
          Oficina de TLC de los derechos civiles, 1200 New Jersey Avenue NW, Washington, DC 20590.
        </p>
      </div>

      {/* Title VI Complaint Form */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Title VI Complaint Form</h3>
        <p className="mb-3">
          Desert Area Resources and Training provides a Title VI Complaint Form in both English and Spanish. The form
          collects information such as:
        </p>
        <ul className="list-disc pl-5 mb-3">
          <li>Name, address, and contact information</li>
          <li>Whether the complaint is being filed by the individual or on behalf of someone else</li>
          <li>The basis of the discrimination (race, color, national origin)</li>
          <li>Date of the alleged discrimination</li>
          <li>Details of what happened</li>
          <li>Whether a complaint has been filed with any other agencies</li>
          <li>Contact information for the transit agency the complaint is against</li>
        </ul>
        <p className="mb-3">
          The complete form is available at our Administrative Office or on our website at www.dartontarget.org.
        </p>
      </div>

      {/* List of Transit-Related Title VI Investigations */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">
          List of Transit-Related Title VI Investigations, Complaints and Lawsuits
        </h3>
        <p className="mb-3">
          Desert Area Resources and Training, also known as DART, has not been involved in any transportation-related
          Title VI investigations, lawsuits or complaints.
        </p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              <th className="border p-2 text-left">Type of Process</th>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Summary (including basis of complaint)</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Action(s) Taken</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Investigations</td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
            </tr>
            <tr>
              <td className="border p-2">1. None</td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
            </tr>
            <tr>
              <td className="border p-2">Lawsuits</td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
            </tr>
            <tr>
              <td className="border p-2">1. None</td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
            </tr>
            <tr>
              <td className="border p-2">Complaints</td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
            </tr>
            <tr>
              <td className="border p-2">1. None</td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
              <td className="border p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Public Participation Plan */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Public Participation Plan</h3>
        <h4 className="font-semibold mt-3 mb-1">About Desert Area Resources and Training, also known as DART</h4>
        <p className="mb-3">
          Founded in 1961 by local parents who sought better options for their older children with intellectual and
          developmental disabilities, Desert Area Resources and Training (DART) is a 501(c)(3) organization whose
          mission is "to provide services and opportunities to people who have intellectual/developmental disabilities
          or other special needs, so they and their families can pursue the dreams and lifestyles they choose." Services
          include employment programs; a work-activity program; in-home support for infants who are not meeting
          developmental milestones; an innovative preschool program; supported living services, advocacy services and
          transportation for persons receiving services from the agency.
        </p>
        <p className="mb-3">
          DART is a licensed vender of the Kern Regional Center (KRC) who is the sole referral agency for persons
          receiving services. DART does not serve the public but rather offers transportation to the limited population
          of funded persons who are first served by the Kern Regional Center and then referred by them to DART for
          services.
        </p>

        <h4 className="font-semibold mt-3 mb-1">Purposes of this plan</h4>
        <p className="mb-3">
          The purpose of this plan is to ensure that the programs and services of Desert Area Resources and Training are
          easily accessible to Low English Proficiency persons who need to access its services.
        </p>
        <p className="mb-3">
          Simply by nature of its mission, DART seeks to promote a completely integrated community that shows no
          discrimination of any nature and offers support to its citizens in ways they may need it. DART's goal is a
          community that is integrated on all levels and is open to all persons regardless of differences among them.
        </p>

        <h4 className="font-semibold mt-3 mb-1">Outreach Efforts conducted by Desert Area Resources and Training</h4>
        <p className="mb-3">
          DART seeks to contribute to local life at every possible level. This is in keeping with the goal of fully
          integrating the persons served into the community. The following is a summary of ongoing outreach efforts:
        </p>
        <ul className="list-disc pl-5 mb-3">
          <li>Board of Directors meetings</li>
          <li>Annual Satisfaction Surveys</li>
          <li>VITA Tax Program</li>
          <li>Spanish Speaking Mothers of Down Syndrome Children Group</li>
          <li>Membership in ARC of California</li>
          <li>Adopt-a-Highway Program</li>
          <li>Ridgecrest Chamber of Commerce</li>
          <li>Rotary Club of the Indian Wells Valley</li>
          <li>Community Connection for Child Care Program</li>
          <li>Kern Regional Center</li>
          <li>Women's Shelter of Indian Wells Valley</li>
          <li>United Way of Indian Wells Valley</li>
          <li>Maturango Museum</li>
          <li>Strategic Plan</li>
        </ul>
      </div>

      {/* Language Assistance Plan */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Language Assistance Plan</h3>
        <h4 className="font-semibold mt-3 mb-1">Section 1: Purpose of the Language Assistance Plan (LAP)</h4>
        <p className="mb-3">
          This plan has been developed to ensure that Desert Area Resources and Services (DART) is in complete
          compliance with the Title VI Program and to ensure that DART's services are accessible to limited English
          proficient individuals (LEP) in need of its services. Title VI of the 1964 Civil Rights Act is one of two
          federal mandates that guarantee the provision of meaningful access to federally-funded services for LEP
          individuals.
        </p>
        <p className="mb-3">Desert Area Resource and Training's Title VI Program Administrator is:</p>
        <div className="bg-[var(--background)] text-[var(--foreground)] p-3 mb-3 border border-[var(--secondary)]">
          <p>Jeannie Luke, Human Resources Manager</p>
          <p>201 East Ridgecrest Blvd.</p>
          <p>Ridgecrest, CA 93555</p>
          <p>760 375 9787, ext. 13</p>
          <p>jluke@dartontarget.org</p>
        </div>
        <p className="mb-3">More information about DART's Title VI Program is available at www.dartontarget.org</p>
      </div>

      {/* Four Factor Analysis */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Four Factor Analysis</h3>
        <p className="mb-3">
          The United States Department of Transportation (DOT) published guidance that directed recipients to ensure
          meaningful access to the benefits, services, information, and other important portions of DART's programs and
          activities for LEP persons who are eligible to receive services from them.
        </p>
        <p className="mb-3">
          Written translations of vital documents are required for each LEP group that meets the threshold of 5% of the
          population or 1,000 persons, whichever is less. Vital documents are defined as documents critical for
          accessing recipient's services or benefits; letters requiring response from customers; complaint forms;
          notification of rights; and information informing customers of free language assistance.
        </p>

        <h4 className="font-semibold mt-3 mb-1">
          Factor 1: The number or proportion of LEP persons eligible to be served or likely to be encountered by the
          program or recipient.
        </h4>
        <p className="mb-3">
          DART is a vender of the Kern Regional Center. All persons who are served by the agency are referred to DART
          through the regional center. There is no solicitation of the community by DART but rather an ongoing
          educational process within the community to ensure that persons and families who are eligible and who need
          services are aware that opportunities for them exist.
        </p>
        <p className="mb-3">
          The only language group exceeding the Safe Harbor provision in the area served by DART is persons who speak
          Spanish. DART's area of service is the city and surrounding area of Ridgecrest, CA.
        </p>

        <table className="w-full border-collapse mb-4">
          <caption className="text-left font-semibold mb-2">American FactFinder: Race or Latino Origin: 2010</caption>
          <thead>
            <tr className="bg-[var(--background)]">
              <th className="border p-2 text-left"></th>
              <th className="border p-2 text-left">Population</th>
              <th className="border p-2 text-left">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Total population of Ridgecrest</td>
              <td className="border p-2">27,616</td>
              <td className="border p-2">100%</td>
            </tr>
            <tr>
              <td className="border p-2">Hispanic or Latino (of any race)</td>
              <td className="border p-2">4,941</td>
              <td className="border p-2">17.9%</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse mb-4">
          <caption className="text-left font-semibold mb-2">
            Ridgecrest (city) QuickFacts from the US Census Bureau: 2012 Estimate
          </caption>
          <thead>
            <tr className="bg-[var(--background)]">
              <th className="border p-2 text-left"></th>
              <th className="border p-2 text-left">Population</th>
              <th className="border p-2 text-left">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Total population of Ridgecrest</td>
              <td className="border p-2">28,323</td>
              <td className="border p-2">100%</td>
            </tr>
            <tr>
              <td className="border p-2">Hispanic or Latino (of any race)</td>
              <td className="border p-2">5,070</td>
              <td className="border p-2">17.9%</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse mb-4">
          <caption className="text-left font-semibold mb-2">
            American FactFinder: Selected Social Characteristics 2008-2012 American Community Survey 5-Year Estimates
          </caption>
          <thead>
            <tr className="bg-[var(--background)]">
              <th className="border p-2 text-left">Ability to Speak English</th>
              <th className="border p-2 text-left">Population</th>
              <th className="border p-2 text-left">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Total population of Ridgecrest 5 years of age and over</td>
              <td className="border p-2">25,801</td>
              <td className="border p-2">100%</td>
            </tr>
            <tr>
              <td className="border p-2">Spanish Speaking</td>
              <td className="border p-2">2,038</td>
              <td className="border p-2">7.9% (+/- 1.7%)</td>
            </tr>
            <tr>
              <td className="border p-2">Speaking English "less than well"</td>
              <td className="border p-2">851</td>
              <td className="border p-2">3.3% (+/- 1.3%)</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse mb-4">
          <caption className="text-left font-semibold mb-2">
            American FactFinder: Language Spoken at Home 2008-2012 American survey 5-Year Estimates
          </caption>
          <thead>
            <tr className="bg-[var(--background)]">
              <th className="border p-2 text-left">Ability to Speak English</th>
              <th className="border p-2 text-left">Population</th>
              <th className="border p-2 text-left">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Population of Ridgecrest 5 years of age and over</td>
              <td className="border p-2">25,801</td>
              <td className="border p-2">100%</td>
            </tr>
            <tr>
              <td className="border p-2">Speak only English</td>
              <td className="border p-2">22,627</td>
              <td className="border p-2">87.7%</td>
            </tr>
            <tr>
              <td className="border p-2">Speak a language other than English</td>
              <td className="border p-2">2,098</td>
              <td className="border p-2">12.3%</td>
            </tr>
            <tr>
              <td className="border p-2">Spanish or Spanish Creole</td>
              <td className="border p-2">3,266</td>
              <td className="border p-2">7.9%</td>
            </tr>
            <tr>
              <td className="border p-2">Speak English "very well"</td>
              <td className="border p-2">1,898</td>
              <td className="border p-2">58.1(+/-12.2%)</td>
            </tr>
            <tr>
              <td className="border p-2">Speak English less than "very well"</td>
              <td className="border p-2">1,368</td>
              <td className="border p-2">41.9 (+/-12/2%)</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border-collapse mb-4">
          <caption className="text-left font-semibold mb-2">
            Ridgecrest Chamber of Commerce: Population by Origin and Race
          </caption>
          <thead>
            <tr className="bg-[var(--background)]">
              <th className="border p-2 text-left">By Origin</th>
              <th className="border p-2 text-left">Population</th>
              <th className="border p-2 text-left">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">2012 Total Population Estimate</td>
              <td className="border p-2">28,080</td>
              <td className="border p-2">100%</td>
            </tr>
            <tr>
              <td className="border p-2 font-semibold" colSpan={3}>
                Population By Origin:
              </td>
            </tr>
            <tr>
              <td className="border p-2">Not Hispanic or Latino</td>
              <td className="border p-2">22,661</td>
              <td className="border p-2">80.7%</td>
            </tr>
            <tr>
              <td className="border p-2">Hispanic</td>
              <td className="border p-2">5,419</td>
              <td className="border p-2">19.3%</td>
            </tr>
            <tr>
              <td className="border p-2 font-semibold" colSpan={3}>
                By Race:
              </td>
            </tr>
            <tr>
              <td className="border p-2">White Alone</td>
              <td className="border p-2">21,509</td>
              <td className="border p-2">76.6%</td>
            </tr>
            <tr>
              <td className="border p-2">African American</td>
              <td className="border p-2">1,151</td>
              <td className="border p-2">4.1%</td>
            </tr>
            <tr>
              <td className="border p-2">Native American</td>
              <td className="border p-2">365</td>
              <td className="border p-2">1.3%</td>
            </tr>
            <tr>
              <td className="border p-2">Asian/Pacific Islander</td>
              <td className="border p-2">1,348</td>
              <td className="border p-2">4.8%</td>
            </tr>
            <tr>
              <td className="border p-2">Some Other Race</td>
              <td className="border p-2"></td>
              <td className="border p-2">7.4%</td>
            </tr>
            <tr>
              <td className="border p-2">Two or More Races</td>
              <td className="border p-2"></td>
              <td className="border p-2">6.0%</td>
            </tr>
          </tbody>
        </table>

        <h4 className="font-semibold mt-3 mb-1">
          Factor 2: The frequency with which LEP persons come into contact with the program.
        </h4>
        <p className="mb-3">
          DART provides support for 200 persons annually. This is .008% of the total population of Ridgecrest. Using the
          percentages listed above, this means that persons speaking English "less than very well" would be less than
          one person. A survey of staff and available records found no instances in which a person had been turned away
          by DART because of language barriers.
        </p>

        <h4 className="font-semibold mt-3 mb-1">
          Factor 3: The nature and importance of the program, activity, or service provided by the program to people's
          lives.
        </h4>
        <p className="mb-3">
          The services provided by DART to funded individuals are life changing. The early support services that are
          offered at the preschool and in the infant home visit program enable small children who are not meeting
          developmental milestones to, in many instances, completely catch up and join with their peers in regular, age
          appropriate activities.
        </p>

        <h4 className="font-semibold mt-3 mb-1">
          Factor 4: The resources available to the recipient for LEP outreach as well as the costs associated with that
          outreach.
        </h4>
        <p className="mb-3">
          Desert Area Resources and Training has a staff of 35 persons. Six of those persons (17.16%) are Spanish
          speaking. Staff has received information about and training in all of the resources mentioned in this section.
        </p>
      </div>

      {/* Notice to LEP persons */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Notice to LEP persons of available language assistance</h3>
        <p className="mb-3">
          Our Limited English Proficiency Policy is posted, in both Spanish and English, beside the Public Notice of
          Title VI policy in all areas listed in this plan:
        </p>
        <div className="bg-[var(--background)] text-[var(--foreground)] p-3 mb-3 border border-[var(--secondary)]">
          <p>
            Desert Area Resources and Training also known as DART strives to ensure that all clients, volunteers and
            staff members have access to all of its programs and services free of charge. DART provides support to all
            persons seeking its services that are in need of language assistance. DART has bilingual staff members that
            can provide written and oral interpretation as needed.
          </p>
        </div>
      </div>

      {/* Implementation of plan */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Implementation of plan</h3>
        <p className="mb-3">
          This section of the plan includes implementation of the LAP, including methodologies for identifying LEP
          individuals, providing services, establishing policies, monitoring the LAP, and recommendations for future LAP
          implementations.
        </p>

        <h4 className="font-semibold mt-3 mb-1">Providing Services:</h4>
        <p className="mb-3">
          On-site agency staff is aware that they can contact a Spanish speaking staff member for translation as needed.
          Documents that area offered in Spanish include:
        </p>
        <ul className="list-disc pl-5 mb-3">
          <li>Limited English Proficiency Policy</li>
          <li>Title VI Notice to the Public</li>
          <li>Title VI Complaint Form</li>
          <li>Title VI Complaint Procedures</li>
          <li>Agency Website: Title VI information</li>
          <li>Grievance Form and Policy</li>
        </ul>
        <p className="mb-3">Other documents can be translated into Spanish orally by staff members as needed.</p>

        <h4 className="font-semibold mt-3 mb-1">Monitoring:</h4>
        <p className="mb-3">
          DART annually assesses its abilities to provide services to the community through publication of the
          Performance Measurement and Management Report, a stakeholder plan that is distributed to more than 20
          interested agencies and is available at our reception area to all who are interested. As part of this annual
          fact gathering activity, all stakeholders including those who receive services, their families, the
          professional community, business community and other public service agencies are all questioned through
          telephone calls and printed surveys.
        </p>

        <h4 className="font-semibold mt-3 mb-1">Employee Training:</h4>
        <p className="mb-3">
          All staff working with funded employees receive a quarterly training by the Case Manager. The Case Manager is
          also in constant touch with the staff through telephone calls and weekly/monthly reports. Training on LEP
          needs was held in May. Staff training information in LEP and Title VI subjects will be forwarded to the Title
          VI Administrator.
        </p>
        <p className="mb-3">
          Information about LEP policies is being added to the Habilitation Handbook and will be revisited at the next
          quarterly meeting when it is added.
        </p>
      </div>

      {/* Translation of vital documents */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Translation of vital documents</h3>
        <p className="mb-3">
          Based on the results of the four factor analysis, the following documents will be translated into Spanish, the
          LEP language within Desert Area Resources and Training's service area:
        </p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              <th className="border p-2 text-left">TRANSLATION ITEM</th>
              <th className="border p-2 text-center">Now</th>
              <th className="border p-2 text-center">Next Year (after July 1)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Notice to Public of Title VI Compliance</td>
              <td className="border p-2 text-center">X</td>
              <td className="border p-2"></td>
            </tr>
            <tr>
              <td className="border p-2">Title VI Procedures</td>
              <td className="border p-2 text-center">X</td>
              <td className="border p-2"></td>
            </tr>
            <tr>
              <td className="border p-2">Limited English Proficiency Policy</td>
              <td className="border p-2 text-center">X</td>
              <td className="border p-2"></td>
            </tr>
            <tr>
              <td className="border p-2">Complaint Form</td>
              <td className="border p-2 text-center">X</td>
              <td className="border p-2"></td>
            </tr>
            <tr>
              <td className="border p-2">Grievance Form</td>
              <td className="border p-2"></td>
              <td className="border p-2 text-center">X</td>
            </tr>
            <tr>
              <td className="border p-2">Customer Concern Form</td>
              <td className="border p-2"></td>
              <td className="border p-2 text-center">X</td>
            </tr>
            <tr>
              <td className="border p-2">Emergency Instruction Book (hangs on wall in all buildings)</td>
              <td className="border p-2"></td>
              <td className="border p-2 text-center">X</td>
            </tr>
            <tr>
              <td className="border p-2">Public Signage in Thrift Store</td>
              <td className="border p-2"></td>
              <td className="border p-2 text-center">X</td>
            </tr>
            <tr>
              <td className="border p-2">List of Common and Helpful Phrases (per site/job classification)</td>
              <td className="border p-2"></td>
              <td className="border p-2 text-center">X</td>
            </tr>
            <tr>
              <td className="border p-2">Hazardous Materials: request information sheets from suppliers</td>
              <td className="border p-2"></td>
              <td className="border p-2 text-center">X</td>
            </tr>
            <tr>
              <td className="border p-2">Employee Manual</td>
              <td className="border p-2"></td>
              <td className="border p-2 text-center">X</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Membership of Non-elected Committees and Councils */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">Membership of Non-elected Committees and Councils</h3>
        <p className="mb-3">
          Desert Area Resources has a Board of Directors comprised of nine volunteers from various business, educational
          and nonprofit entities in Ridgecrest plus two non-voting individuals who receive support from the agency. The
          Board and The Chief Executive Officer constantly strive to find appropriate community volunteers of multiple
          ethnicity and experience in keeping with best practices of composition for nonprofit boards of this type.
        </p>
        <p className="mb-3">
          This is the only committee or council within DART. There is no specific transit related advisory council at
          this time. Questions regarding transit policy are handled by the Board of Directors.
        </p>

        <h4 className="font-semibold mt-3 mb-1">
          Desert Area Resources and Training Board of Directors by individuals:
        </h4>
        <table className="w-full border-collapse mb-3">
          <thead>
            <tr className="bg-[var(--background)]">
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Race</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Nick Coy</td>
              <td className="border p-2">Latin / Native American</td>
            </tr>
            <tr>
              <td className="border p-2">Alice Benton</td>
              <td className="border p-2">Caucasian</td>
            </tr>
            <tr>
              <td className="border p-2">Leslie Brown</td>
              <td className="border p-2">Caucasian</td>
            </tr>
            <tr>
              <td className="border p-2">Little Deer Durvin</td>
              <td className="border p-2">Native American</td>
            </tr>
            <tr>
              <td className="border p-2">Michelle Kilikauskas</td>
              <td className="border p-2">Caucasian</td>
            </tr>
            <tr>
              <td className="border p-2">Frank Moreno</td>
              <td className="border p-2">Latin</td>
            </tr>
            <tr>
              <td className="border p-2">Bill Opalewski</td>
              <td className="border p-2">Caucasian</td>
            </tr>
            <tr>
              <td className="border p-2">Alana Stein</td>
              <td className="border p-2">Caucasian</td>
            </tr>
            <tr>
              <td className="border p-2">Patricia Stewart</td>
              <td className="border p-2">Caucasian</td>
            </tr>
            <tr>
              <td className="border p-2">Ann Kirk (Advocate Representative)</td>
              <td className="border p-2">Caucasian</td>
            </tr>
            <tr>
              <td className="border p-2">Ronnie Petersen (Advocate Representative)</td>
              <td className="border p-2">Caucasian</td>
            </tr>
          </tbody>
        </table>

        <h4 className="font-semibold mt-3 mb-1">Desert Area Resources and Training Board of Directors by origin:</h4>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--background)]">
              <th className="border p-2 text-left">Origin</th>
              <th className="border p-2 text-left">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">Caucasian</td>
              <td className="border p-2">72.72%</td>
            </tr>
            <tr>
              <td className="border p-2">Latin</td>
              <td className="border p-2">18.18%</td>
            </tr>
            <tr>
              <td className="border p-2">Native American</td>
              <td className="border p-2">9.09%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Board of Directors Approval */}
      <div className="mb-6">
        <h3 className="font-bold text-lg mb-2">
          Board of Directors Approval of Desert Area and Resources' Title VI Plan
        </h3>
        <p className="mb-3">
          This Title VI Plan was approved by the Desert Area Resources and Training Board of Directors on June 7, 2014.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-[var(--background)] text-xs text-[var(--foreground)]">
        <p>© 2023 Desert Area Resources and Training (DART)</p>
        <p>201 East Ridgecrest Blvd.</p>
        <p>Ridgecrest, CA 93555</p>
        <p>760-375-9787 | www.dartontarget.org</p>
      </div>
    </div>
  )
}
