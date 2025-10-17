<template>
    <div>
        <div ref="cardElement"></div> <!-- Use Vue ref -->
        <div id="card-errors" role="alert">{{ cardError }}</div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
    stripe: Object,
    elements: Object
});

const cardElementRef = ref(null);
const cardError = ref('');

let card; // To hold the card element instance

onMounted(() => {
    if (props.stripe && props.elements) {
        // Create an instance of the card Element
        card = props.elements.create('card', {
            style: {
                base: {
                    color: "#32325d",
                    fontFamily: 'Arial, sans-serif',
                    fontSmoothing: "antialiased",
                    fontSize: "16px",
                    "::placeholder": {
                        color: "#aab7c4"
                    }
                },
                invalid: {
                    color: "#fa755a",
                    iconColor: "#fa755a"
                }
            }
        });

        // Add an instance of card Element into the mount point
        card.mount(cardElementRef.value);

        // Handle real-time validation errors from the card Element
        card.on('change', function (event) {
            if (event.error) {
                cardError.value = event.error.message;
            } else {
                cardError.value = '';
            }
            // Emit card change event to parent
            emit('change', event);
        });
    }
});

// Clean up
watch(() => props.stripe, (newStripe, oldStripe) => {
    if (oldStripe) {
        card.unmount();
    }
});

// Expose card for parent component
defineExpose({ card });
</script>