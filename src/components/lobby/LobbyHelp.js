import React, { useState } from "react";
import { ChevronUp, ChevronDown, MessageCircle } from "lucide-react";
import { FaWhatsapp } from 'react-icons/fa';
import CustomText from "../basics/CustomText";
import CustomButton from "../basics/CustomButton";

const FAQItem = ({ question, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-[#E5E7EB] rounded-3xl mb-4 overflow-hidden bg-white shadow-sm transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-gray-50"
            >
                <span className="text-[#4059FF] font-bold text-sm sm:text-base">
                    {question}
                </span>
                {isOpen ? (
                    <ChevronUp className="text-[#4059FF]" size={20} />
                ) : (
                    <ChevronDown className="text-[#4059FF]" size={20} />
                )}
            </button>

            {isOpen && (
                <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="h-px bg-gray-100 mb-4" />
                    <div className="text-[#3D3D44] text-sm leading-relaxed">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function LobbyHelp() {
    return (
        <div className="flex flex-col gap-8 w-full px-10">
            {/* Banner de Contacto */}
            <div className="relative overflow-hidden rounded-[32px] bg- p-8 sm:p-10 shadow-soft">
                <div className="relative z-10 flex flex-col gap-4 max-w-xl">
                    <CustomText variant="TitleL" className="font-black text-[#0E3C42]">
                        ¿Tienes algún problema?
                    </CustomText>
                    <CustomText variant="bodyM" className="text-[#3D3D44]">
                        Estamos aquí para ayudarte, envíanos un mensaje para asistencia rápida.
                    </CustomText>
                    <div>
                        <CustomButton className="flex items-center gap-2 px-6 py-2" variant="primary">
                            <FaWhatsapp size={20} fill="currentColor" />
                            <CustomText variant="bodyM" className="text-[#3D3D44]">
                                Contactanos
                            </CustomText>
                        </CustomButton>
                    </div>
                </div>

                <div className="absolute -top-20 -left-40 w-[300px] h-[300px] bg-[#94A2FF] opacity-80 blur-[90px] rounded-full pointer-events-none" />

                {/* 2. Mancha verde (Arriba Centro/Derecha) */}
                <div className="absolute -top-40 left-1/4 w-[200px] h-[300px] bg-[#ABE7E5] opacity-80 blur-[90px] rounded-full pointer-events-none" />

                {/* 3. Mancha morada secundaria (Centro Izquierda bajando) */}
                <div className="absolute -top-10 right-0 w-[150px] h-[300px] bg-[#ABE7E5] opacity-80 blur-[90px] rounded-full pointer-events-none" />

                {/* 4. Mancha verde de mezcla (Centro) */}
                <div className="absolute top-1/4 right-1/4 w-[250px] h-[200px] bg-[#94A2FF] opacity-80 blur-[100px] rounded-full pointer-events-none" />

                <img
                    src="/logos/decorations/figureTwo.png"
                    className="absolute bottom-0 right-0 h-full w-auto pointer-events-none select-none"
                    alt="decoration"
                />
            </div>

            {/* Listado de FAQs */}
            <div className="flex flex-col">
                <CustomText variant="TitleM" className="font-black text-[#0E3C42] mb-6">
                    Preguntas frecuentes
                </CustomText>

                <FAQItem question="¿Cómo se vota?">
                    <ol className="list-decimal ml-4 space-y-2 text-[#3D3D44]">
                        <li className="text-[#3D3D44] text-[16px]">El operador iniciará la votación de cada pregunta.</li>
                        <li className="text-[#3D3D44] text-[16px]">La pregunta aparecerá en tu pantalla.</li>
                        <li className="text-[#3D3D44] text-[16px]">Selecciona tu respuesta.</li>
                        <li className="text-[#3D3D44] text-[16px]">Pulsa el botón "votar" para registrar tu voto.</li>
                        <li className="text-[#3D3D44] text-[16px]">Si tienes hasta 4 representaciones, puedes votar por cada propiedad o una sola vez para todas (según tu elección inicial).</li>
                    </ol>
                </FAQItem>

                <FAQItem question="¿Cómo edito mi registro?">
                    <p>No se puede editar. Debe solicitar al operador logístico la eliminación para volver a registrarse.</p>
                </FAQItem>

                <FAQItem question="Sobre los resultados de las votaciones">
                    <div className="space-y-4">
                        <p className="font-bold">Los resultados emitidos en la plataforma se obtienen con base en los coeficientes, según lo establecido en la Ley 675 de 2001:</p>
                        <ul className="space-y-3">
                            <li>
                                <span className="font-bold text-[#0E3C42]">Artículo 45. Quórum y mayorías:</span>
                                "Con excepción de los casos en que la ley o el reglamento de propiedad horizontal exijan un quórum o mayoría superior... la asamblea general sesionará con un número plural de propietarios... que representen más de la mitad de los coeficientes de copropiedad..."
                            </li>
                        </ul>
                    </div>
                </FAQItem>
            </div>
        </div >
    );
};

