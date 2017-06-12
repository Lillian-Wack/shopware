<?php
declare(strict_types=1);
/**
 * Shopware 5
 * Copyright (c) shopware AG
 *
 * According to our dual licensing model, this program can be used either
 * under the terms of the GNU Affero General Public License, version 3,
 * or under a proprietary license.
 *
 * The texts of the GNU Affero General Public License with an additional
 * permission and of our proprietary license can be found at and
 * in the LICENSE file you have received along with this program.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * "Shopware" is a registered trademark of shopware AG.
 * The licensing of the program under the AGPLv3 does not imply a
 * trademark license. Therefore any rights, title and interest in
 * our trademarks remain entirely with us.
 */

namespace Shopware\Bundle\CartBundle\Domain\Price;

use Shopware\Bundle\CartBundle\Domain\Tax\CalculatedTaxCollection;
use Shopware\Bundle\CartBundle\Domain\Tax\TaxRuleCollection;
use Shopware\Bundle\StoreFrontBundle\Common\Collection;

class PriceCollection extends Collection
{
    /**
     * @var Price[]
     */
    protected $elements = [];

    public function add(Price $price): void
    {
        parent::doAdd($price);
    }

    public function remove(string $key): void
    {
        parent::doRemoveByKey($key);
    }

    public function get(string $key): ? Price
    {
        if ($this->has($key)) {
            return $this->elements[$key];
        }

        return null;
    }

    public function getTaxRules(): TaxRuleCollection
    {
        $rules = new TaxRuleCollection([]);
        foreach ($this->elements as $price) {
            $rules = $rules->merge($price->getTaxRules());
        }

        return $rules;
    }

    public function sum(): Price
    {
        return new Price(
            $this->getUnitPriceAmount(),
            $this->getAmount(),
            $this->getCalculatedTaxes(),
            $this->getTaxRules()
        );
    }

    public function getCalculatedTaxes(): CalculatedTaxCollection
    {
        $taxes = new CalculatedTaxCollection([]);
        foreach ($this->elements as $price) {
            $taxes = $taxes->merge($price->getCalculatedTaxes());
        }

        return $taxes;
    }

    public function merge(PriceCollection $prices): PriceCollection
    {
        return $this->doMerge($prices);
    }

    private function getUnitPriceAmount(): float
    {
        $prices = $this->map(function (Price $price) {
            return $price->getUnitPrice();
        });

        return array_sum($prices);
    }

    private function getAmount(): float
    {
        $prices = $this->map(function (Price $price) {
            return $price->getTotalPrice();
        });

        return array_sum($prices);
    }
}
