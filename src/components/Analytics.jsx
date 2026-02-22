import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { PieChart, Pie, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export default function Analytics({ session }) {
    const [chartData, setChartData] = useState([])
    const [loading, setLoading] = useState(true)
    const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());
    const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());


    useEffect(() => {
        getStats()
    }, [mesSeleccionado, anioSeleccionado])

    const getStats = async () => {
        const { data } = await supabase
            .from('expenses')
            .select('amount,created_at ,categories(name, color)')
            .eq('user_id', session.user.id)

        if (data) {


            const datosDelMes = data.filter(gasto => {
                const fechaGasto = new Date(gasto.created_at);

                const esMismoMes = fechaGasto.getMonth() === mesSeleccionado;
                const esMismoAnio = fechaGasto.getFullYear() === anioSeleccionado;

                return esMismoMes && esMismoAnio;
            });

            const grouped = datosDelMes.reduce((acc, curr) => {
                const catName = curr.categories?.name || 'Otros'
                if (!acc[catName]) acc[catName] = { name: catName, value: 0, color: '#6366f1' }
                acc[catName].value += curr.amount
                return acc
            }, {})

            const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff6b6b']

            const formattedData = Object.values(grouped).map((item, index) => ({
                ...item,
                fill: COLORS[index % COLORS.length]
            }))

            setChartData(formattedData)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Análisis de Gastos</h2>

            <div className="grid md:grid-cols-3 gap-8">

                <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border h-100 border-gray-100 min-h-[600px] flex flex-col gap-8">
                    <h3 className="font-bold text-gray-800 mb-4 text-lg">Distribución Visual</h3>
                    {loading ? <p>Cargando...</p> : (
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    />
                                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-6 bg-gray-50 p-2 rounded-lg">
                        <button
                            onClick={() => {
                                if (mesSeleccionado === 0) {
                                    setMesSeleccionado(11);
                                    setAnioSeleccionado(anioSeleccionado - 1);
                                } else {
                                    setMesSeleccionado(mesSeleccionado - 1);
                                }
                            }}
                            className="px-4 py-2 bg-slate-300 text-gray-700 rounded-md hover:bg-slate-400 font-medium transition-colors"
                        >
                            &larr; Mes Anterior
                        </button>

                        <span className="font-bold text-gray-700">
                            Mes: {mesSeleccionado + 1} / {anioSeleccionado}
                        </span>

                        <button
                            onClick={() => {
                                if (mesSeleccionado === 11) {
                                    setMesSeleccionado(0);
                                    setAnioSeleccionado(anioSeleccionado + 1);
                                } else {
                                    setMesSeleccionado(mesSeleccionado + 1);
                                }
                            }}
                            className="px-4 py-2 bg-slate-300 text-gray-700 rounded-md hover:bg-slate-400 font-medium transition-colors"
                        >
                            Mes Siguiente &rarr;
                        </button>
                    </div>

                </div>


                <div className="bg-white p-8 rounded-3xl shadow-xl h-fit">
                    <h3 className="font-bold text-gray-800 mb-6 text-lg">Top Gastos</h3>
                    <div className="space-y-4">
                        {chartData.length === 0 && <p className="text-gray-400">No hay datos aún.</p>}
                        {[...chartData].sort((a, b) => b.value - a.value).map((item) => (
                            <div key={item.name} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.fill }}></div>
                                    <span className="font-medium text-gray-600">{item.name}</span>
                                </div>
                                <span className="font-bold text-gray-900 text-lg">${item.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}