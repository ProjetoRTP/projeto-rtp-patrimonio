document.addEventListener("DOMContentLoaded", function () {

            const selectTipo = document.getElementById("tipoEquipamento");
            const camposComputador = document.getElementById("campos-computador");
            const camposImpressora = document.getElementById("campos-impressora");

            // Sempre começa escondido
            camposComputador.classList.add("d-none");
            camposImpressora.classList.add("d-none");

            selectTipo.addEventListener("change", function () {

                const valor = this.value;

                // Esconde tudo primeiro
                camposComputador.classList.add("d-none");
                camposImpressora.classList.add("d-none");

                // Mostra o certo
                if (valor === "1") {
                    camposComputador.classList.remove("d-none");
                } else if (valor === "2") {
                    camposImpressora.classList.remove("d-none");
                }

            });

        });