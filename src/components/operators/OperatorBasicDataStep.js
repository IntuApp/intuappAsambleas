"use client";

import CustomInput from "@/components/basics/inputs/CustomInput";
import CustomText from "@/components/basics/CustomText";
import CustomSelect from "@/components/basics/inputs/CustomSelect";
import { colombiaCities } from "@/constans/colombiaCities";

export default function OperatorDataBasicStep({
  mode,
  formDataOperator,
  setFormDataOperator,
  confirmEmail,
  setConfirmEmail,
  confirmPassword,
  setConfirmPassword,
}) {
  if (!formDataOperator) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* CARD 1 */}
      <div className="max-w-[1128px] max-h-[517px] w-full h-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5">
        <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">
          1. Datos del {mode === "edit" ? "operador" : "nuevo operador"}
        </CustomText>

        <CustomText variant="bodyL" className="text-[#333333] font-regular">
          Complete los campos a continuación para registrar un nuevo operador.
        </CustomText>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <CustomInput
            label="Nombre del Operador"
            name="name"
            placeholder="Escribe aquí el nombre"
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={formDataOperator?.name}
            onChange={(e) =>
              setFormDataOperator({
                ...formDataOperator,
                name: e.target.value,
              })
            }
          />

          <CustomInput
            label="NIT"
            name="nit"
            placeholder="Escribe aquí el NIT"
            optional
            className="max-w-[344px] max-h-[80px] "
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={formDataOperator.nit}
            onChange={(e) =>
              setFormDataOperator({
                ...formDataOperator,
                nit: e.target.value,
              })
            }
          />

          <CustomSelect
            label="Ciudad"
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classSelect="text-[#838383] font-normal border-[#D3DAE0] "
            value={formDataOperator.city}
            onChange={(e) =>
              setFormDataOperator({
                ...formDataOperator,
                city: e.target.value,
              })
            }
          >
            <option value="">Selecciona aquí tu ciudad</option>
            {colombiaCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </CustomSelect>
        </div>

        <div className="rounded-t border border-[#D3DAE0]"></div>
        <CustomText variant="bodyL" className="text-[#333333] font-regular">
          Ingrese los datos del representante legal o funcionario
        </CustomText>
        <div className="grid grid-cols-3 gap-6 mb-10">
          <CustomInput
            label="Nombre del Representante"
            placeholder="Escribe aquí el nombre"
            optional
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={formDataOperator.representativeName}
            onChange={(e) =>
              setFormDataOperator({
                ...formDataOperator,
                representativeName: e.target.value,
              })
            }
          />

          <CustomInput
            label="Correo"
            placeholder="Escribe aquí el correo"
            optional
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={formDataOperator.representativeEmail}
            onChange={(e) =>
              setFormDataOperator({
                ...formDataOperator,
                representativeEmail: e.target.value,
              })
            }
          />

          <CustomInput
            label="Número de celular"
            placeholder="Escribe aquí el número"
            optional
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={formDataOperator.representativePhone}
            onChange={(e) =>
              setFormDataOperator({
                ...formDataOperator,
                representativePhone: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="max-w-[1128px] max-h-[361px] w-full h-full bg-[#FFFFFF] border border-[#F3F6F9] rounded-3xl p-6 flex flex-col gap-5">
        <CustomText variant="bodyX" className="text-[#0E3C42] font-bold">
          2. {mode === "edit" ? "Credenciales de acceso" : "Crear usuario"}
        </CustomText>

        <CustomText variant="bodyL" className="text-[#333333] font-regular">
          Asigne el correo y la contraseña para el ingreso a la plataforma.
        </CustomText>

        <div className="grid grid-cols-2 gap-6">
          <CustomInput
            label="Correo"
            placeholder="Escribe aquí el correo"
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={formDataOperator.email}
            onChange={(e) =>
              setFormDataOperator({
                ...formDataOperator,
                email: e.target.value,
              })
            }
          />

          <CustomInput
            label="Confirmar correo"
            placeholder="Escribe aquí el correo"
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
          />
        </div>
        <div className="rounded-t border border-[#D3DAE0]"></div>

        <div className="grid grid-cols-2 gap-6">
          <CustomInput
            label="Contraseña"
            type="password"
            placeholder="Escriba aquí la contraseña"
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={formDataOperator.password}
            onChange={(e) =>
              setFormDataOperator({
                ...formDataOperator,
                password: e.target.value,
              })
            }
          />

          <CustomInput
            label="Confirmar contraseña"
            type="password"
            placeholder="Escriba aquí la contraseña"
            className="max-w-[344px] max-h-[80px]"
            classLabel="text-[#333333] font-bold"
            classInput="max-w-[344px] max-h-[56px] w-full pl-4 pr-4 py-3 rounded-lg border"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
