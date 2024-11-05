export const planos = [
	{
		reference_id: "bronze_plan",
		plan: {
			id: "PLAN_ID_BRONZE", // Substitua por um ID de plano válido
			name: "Plano Bronze",
			description: "Assinatura do plano Bronze",
			amount: {
				value: 1990 // Valor em centavos
			},
			period: {
				value: 1,
				unit: "MONTH"
			}
		},
		customer: {
			reference_id: "customer_bronze",
			name: "Cliente Bronze",
			email: "cliente.bronze@example.com",
			tax_id: "12345678901", // CPF do cliente
			phones: [
				{
					country: "55",
					area: "11",
					number: "999999999"
				}
			]
		},
		payment_method: [
			{
				type: "CREDIT_CARD",
				card: {
					number: "4111111111111111",
					exp_month: "12",
					exp_year: "2024",
					security_code: "123",
					holder: {
						name: "Cliente Bronze",
						birth_date: "1985-01-01",
						tax_id: "12345678901", // CPF do titular
						billing_address: {
							street: "Rua Exemplo",
							number: "123",
							complement: "Apto 1",
							district: "Bairro Exemplo",
							city: "São Paulo",
							state: "SP",
							country: "BRA",
							postal_code: "01000000"
						}
					}
				}
			}
		]
	},

	{
		reference_id: "gold_plan",
		plan: {
			id: "PLAN_ID_GOLD", // Substitua por um ID de plano válido
			name: "Plano Ouro",
			description: "Assinatura do plano Ouro",
			amount: {
				value: 3990 // Valor em centavos
			},
			period: {
				value: 1,
				unit: "MONTH"
			}
		},
		customer: {
			reference_id: "customer_gold",
			name: "Cliente Ouro",
			email: "cliente.ouro@example.com",
			tax_id: "12345678901", // CPF do cliente
			phones: [
				{
					country: "55",
					area: "11",
					number: "999999999"
				}
			]
		},
		payment_method: [
			{
				type: "CREDIT_CARD",
				card: {
					number: "4111111111111111",
					exp_month: "12",
					exp_year: "2024",
					security_code: "123",
					holder: {
						name: "Cliente Ouro",
						birth_date: "1985-01-01",
						tax_id: "12345678901", // CPF do titular
						billing_address: {
							street: "Rua Exemplo",
							number: "123",
							complement: "Apto 1",
							district: "Bairro Exemplo",
							city: "São Paulo",
							state: "SP",
							country: "BRA",
							postal_code: "01000000"
						}
					}
				}
			}
		]
	},

	{
		reference_id: "silver_plan",
		plan: {
			id: "PLAN_ID_SILVER", // Substitua por um ID de plano válido
			name: "Plano Prata",
			description: "Assinatura do plano Prata",
			amount: {
				value: 2990 // Valor em centavos
			},
			period: {
				value: 1,
				unit: "MONTH"
			}
		},
		customer: {
			reference_id: "customer_silver",
			name: "Cliente Prata",
			email: "cliente.prata@example.com",
			tax_id: "12345678901", // CPF do cliente
			phones: [
				{
					country: "55",
					area: "11",
					number: "999999999"
				}
			]
		},
		payment_method: [
			{
				type: "CREDIT_CARD",
				card: {
					number: "4111111111111111",
					exp_month: "12",
					exp_year: "2024",
					security_code: "123",
					holder: {
						name: "Cliente Prata",
						birth_date: "1985-01-01",
						tax_id: "12345678901", // CPF do titular
						billing_address: {
							street: "Rua Exemplo",
							number: "123",
							complement: "Apto 1",
							district: "Bairro Exemplo",
							city: "São Paulo",
							state: "SP",
							country: "BRA",
							postal_code: "01000000"
						}
					}
				}
			}
		]
	}
];
