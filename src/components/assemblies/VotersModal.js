import React, { useState, useMemo, useEffect } from "react";
import { Search, X } from "lucide-react";
import CustomText from "@/components/basics/CustomText";
import CustomButton from "@/components/basics/CustomButton";
import { getDataByOwnerId } from "@/lib/masterData"; 
import { useParams } from "next/navigation";

const QUESTION_TYPES = { UNIQUE: "1", MULTIPLE: "2", YES_NO: "3", OPEN: "4" };

export default function VotersModal({
    isOpen,
    onClose,
    question,
    votes = [],
}) {
    const { assemblyId } = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [enrichedVotes, setEnrichedVotes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // 1. Filtrar solo los votos que corresponden a esta pregunta
    const questionVotes = useMemo(() => {
        if (!question) return [];
        return votes.filter((v) => v.questionId === question.id);
    }, [votes, question]);

    // 2. Efecto para enriquecer los votos consultando a Firebase
    useEffect(() => {
        const fetchPropertyData = async () => {
            if (!question || questionVotes.length === 0 || !assemblyId) {
                setEnrichedVotes([]);
                return;
            }

            setIsLoading(true);

            // Creamos un array de promesas para buscar los datos de todas las propiedades en paralelo
            const enrichedPromises = questionVotes.map(async (vote) => {
                const ownerId = vote.propertyOwnerId;

                // Llamamos a la nueva función de Firebase
                const result = await getDataByOwnerId(ownerId, assemblyId);
                console.log(result);
                

                let propertyData = {};
                if (result.success && result.data) {
                    propertyData = result.data;
                }

                // Determinar qué respondió el usuario
                let answerText = "";
                if (question.typeId === QUESTION_TYPES.OPEN) {
                    answerText = vote.openTextAnswer || "Sin respuesta";
                } else if (vote.selectedOptionIds && vote.selectedOptionIds.length > 0) {
                    const selectedTexts = vote.selectedOptionIds.map((optId) => {
                        const option = question.options?.find((o) => o.id === optId);
                        return option ? option.text : "Opción desconocida";
                    });
                    answerText = selectedTexts.join(", ");
                } else {
                    answerText = "Voto en blanco / no registrado";
                }

                return {
                    id: vote.propertyOwnerId + vote.registrationId,
                    // Extraemos los datos, si no están, mostramos el N/A
                    tipo: propertyData.Tipo || propertyData.tipo || "N/A",
                    grupo: propertyData.Grupo || propertyData.grupo || "N/A",
                    // Si encontramos la propiedad, mostramos su nombre, si no, fallback al ID
                    propiedad: propertyData.Propiedad || propertyData.propiedad || ownerId,
                    // Preferimos el poder de voto guardado, luego el de la BD
                    coeficiente: vote.votingPower || propertyData.Coeficiente || propertyData.coeficiente || 0,
                    documento: vote.registrationId || "N/A",
                    respuesta: answerText,
                };
            });

            // Esperamos a que todas las consultas terminen
            const resolvedVotes = await Promise.all(enrichedPromises);
            setEnrichedVotes(resolvedVotes);
            setIsLoading(false);
        };

        if (isOpen) {
            fetchPropertyData();
        }
    }, [questionVotes, question, assemblyId, isOpen]);

    // 3. Aplicar el buscador
    const filteredVotes = useMemo(() => {
        if (!searchTerm) return enrichedVotes;
        const lowerTerm = searchTerm.toLowerCase();

        return enrichedVotes.filter(
            (v) =>
                v.grupo.toLowerCase().includes(lowerTerm) ||
                v.propiedad.toLowerCase().includes(lowerTerm) ||
                v.documento.toLowerCase().includes(lowerTerm) ||
                v.respuesta.toLowerCase().includes(lowerTerm)
        );
    }, [enrichedVotes, searchTerm]);

    if (!isOpen || !question) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-[#00093F]/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="bg-white w-full max-w-[850px] rounded-[32px] shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 z-10 overflow-hidden">
                <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex flex-col gap-4 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    <CustomText variant="TitleL" className="font-black text-[#0E3C42]">
                        Votantes
                    </CustomText>

                    <CustomText variant="bodyM" className="text-[#3D3D44] pr-8 leading-relaxed">
                        Aquí puedes ver el listado de los asambleístas que votaron en la pregunta:{" "}
                        <span className="font-bold text-[#0E3C42]">{question.title}</span>
                    </CustomText>

                    <div className="relative mt-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Busca por grupo, # de unidad privada, documento o nombre"
                            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-[#4059FF] transition-colors text-[14px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <CustomText variant="labelM" className="text-gray-500">
                            Total de asambleístas que votaron:
                        </CustomText>
                        <span className="bg-[#B8EAF0] text-[#0E3C42] px-3 py-1 rounded-full text-xs font-bold">
                            {questionVotes.length}
                        </span>
                    </div>
                </div>

                <div className="overflow-y-auto no-scrollbar p-8 pt-4 flex-1">
                    <div className="border border-gray-200 rounded-2xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-white border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-bold text-[#0E3C42]">Tipo</th>
                                    <th className="px-6 py-4 text-sm font-bold text-[#0E3C42]">Grupo</th>
                                    <th className="px-6 py-4 text-sm font-bold text-[#0E3C42]"># propiedad</th>
                                    <th className="px-6 py-4 text-sm font-bold text-[#0E3C42]">Coeficiente</th>
                                    <th className="px-6 py-4 text-sm font-bold text-[#0E3C42]">Documento</th>
                                    <th className="px-6 py-4 text-sm font-bold text-[#0E3C42]">Respuesta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">
                                            Cargando datos de las propiedades...
                                        </td>
                                    </tr>
                                ) : filteredVotes.length > 0 ? (
                                    filteredVotes.map((vote) => (
                                        <tr key={vote.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-[#3D3D44] capitalize">{vote.tipo}</td>
                                            <td className="px-6 py-4 text-sm text-[#3D3D44]">{vote.grupo}</td>
                                            <td className="px-6 py-4 text-sm text-[#3D3D44]">{vote.propiedad}</td>
                                            <td className="px-6 py-4 text-sm text-[#3D3D44]">
                                                {parseFloat(vote.coeficiente).toFixed(6)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#3D3D44]">{vote.documento}</td>
                                            <td className="px-6 py-4 text-sm text-[#3D3D44] font-medium">{vote.respuesta}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">
                                            No se encontraron votantes.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-white">
                    <CustomButton
                        variant="primary"
                        onClick={onClose}
                        className="w-full py-4 shadow-lg shadow-indigo-100"
                    >
                        <CustomText variant="bodyM" className="font-bold">
                            Aceptar
                        </CustomText>
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}